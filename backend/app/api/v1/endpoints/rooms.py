from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import List

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.game.game_rooms import GameRoom
from app.models.game.room_players import RoomPlayer
from app.models.quiz.quizzes import Quiz
from app.models.user_auth.users import User
from app.websockets.game_socket import manager

router = APIRouter(prefix="/rooms", tags=["rooms"])


def _serialize_room(room: GameRoom):
    return {
        "id": str(room.id),
        "room_code": room.room_code,
        "host_id": str(room.host_id) if room.host_id else None,
        "quiz_id": str(room.quiz_id),
        "status": room.status,
        "started_at": room.started_at,
        "ended_at": room.ended_at,
    }


def _serialize_player(player: RoomPlayer):
    return {
        "id": str(player.id),
        "room_id": str(player.room_id),
        "user_id": str(player.user_id),
        "display_name": player.display_name,
        "score": player.score,
    }


def _serialize_room_state(room: GameRoom, db: Session):
    players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
    return {
        "room": _serialize_room(room),
        "players": [_serialize_player(player) for player in players],
        "player_count": len(players),
    }


def _build_room_code() -> str:
    return uuid4().hex[:6].upper()


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_room(payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz_id = payload.get("quiz_id")
    if not quiz_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing quiz_id")

    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if not quiz.is_public and quiz.created_by != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to use this quiz")

    room = GameRoom(
        room_code=_build_room_code(),
        host_id=current_user,
        quiz_id=quiz.id,
        status="WAITING",
        max_players=payload.get("max_players", 30),
        shuffle_questions=payload.get("shuffle_questions", True),
        chat_enabled=payload.get("chat_enabled", True),
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    user = db.query(User).filter(User.id == current_user).first()
    host_player = RoomPlayer(
        room_id=room.id,
        user_id=current_user,
        display_name=user.username if user else "Host",
        score=0,
    )
    db.add(host_player)
    db.commit()

    return _serialize_room(room)


@router.get("/{room_code}", response_model=dict)
def get_room(room_code: str, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    # Get quiz preview with question count and total duration
    quiz = room.quiz
    question_count = len(quiz.questions) if quiz.questions else 0
    
    # Calculate total duration: sum of time_limits + (question_count * 3 seconds)
    time_limit_sum = sum(q.time_limit or 0 for q in quiz.questions) if quiz.questions else 0
    total_duration_seconds = time_limit_sum + (question_count * 3)
    total_duration_minutes = total_duration_seconds // 60
    total_duration_remaining = total_duration_seconds % 60

    # Get all players
    players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
    serialized_players = [_serialize_player(player) for player in players]

    return {
        "id": str(room.id),
        "room_code": room.room_code,
        "host_id": str(room.host_id) if room.host_id else None,
        "status": room.status,
        "created_at": room.created_at,
        "started_at": room.started_at,
        "ended_at": room.ended_at,
        "quiz": {
            "id": str(quiz.id),
            "title": quiz.title,
            "description": quiz.description,
            "question_count": question_count,
            "total_duration_seconds": total_duration_seconds,
            "total_duration_formatted": f"~{total_duration_minutes}m {total_duration_remaining}s" if total_duration_minutes > 0 else f"~{total_duration_remaining}s",
            "created_by": str(quiz.created_by) if quiz.created_by else None,
        },
        "players": serialized_players,
        "player_count": len(serialized_players),
        "settings": {
            "max_players": room.max_players,
            "shuffle_questions": room.shuffle_questions,
            "chat_enabled": room.chat_enabled,
            "current_question_order": room.current_question_order,
        },
    }


@router.post("/{room_code}/join", response_model=dict)
async def join_room(room_code: str, payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    # Check if player already in room
    existing = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user).first()
    if not existing:
        # Check if room is full
        player_count = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).count()
        if player_count >= room.max_players:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Room is full")

        # Check if room is already playing
        if room.status != "WAITING":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Room is not in WAITING status")

    display_name = payload.get("display_name")
    if not display_name:
        user = db.query(User).filter(User.id == current_user).first()
        display_name = user.username if user else "Player"

    if existing:
        # Update display name if already in room
        existing.display_name = display_name
        db.commit()
        db.refresh(existing)
        await manager.broadcast(room.room_code, {
            "type": "PLAYER_JOINED",
            "data": {
                **_serialize_room_state(room, db),
                "player": _serialize_player(existing),
            },
        })
        return _serialize_player(existing)

    # Add new player
    player = RoomPlayer(room_id=room.id, user_id=current_user, display_name=display_name, score=0)
    db.add(player)
    db.commit()
    db.refresh(player)
    await manager.broadcast(room.room_code, {
        "type": "PLAYER_JOINED",
        "data": {
            **_serialize_room_state(room, db),
            "player": _serialize_player(player),
        },
    })
    return _serialize_player(player)


@router.post("/{room_code}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_room(room_code: str, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    # If host leaves, close the room completely.
    if room.host_id == current_user:
        room_state = _serialize_room_state(room, db)
        await manager.broadcast(room_code, {
            "type": "ROOM_CLOSED",
            "data": {
                **room_state,
                "reason": "HOST_LEFT",
                "message": "Host đã rời phòng, phòng đã đóng.",
            },
        })
        db.delete(room)
        db.commit()
        return None

    player = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user).first()
    if player:
        departed_player = _serialize_player(player)
        db.delete(player)
        db.commit()
        remaining_players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
        await manager.broadcast(room_code, {
            "type": "PLAYER_LEFT",
            "data": {
                "room_code": room_code,
                "player": departed_player,
                "players": [_serialize_player(remaining_player) for remaining_player in remaining_players],
                "player_count": len(remaining_players),
            },
        })
    return None


@router.get("/{room_code}/players", response_model=list)
def get_room_players(room_code: str, db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
    return [_serialize_player(player) for player in players]


@router.post("/{room_code}/start", response_model=dict)
async def start_game(room_code: str, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    if room.host_id != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only host can start the game")

    room.status = "PLAYING"
    room.started_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(room)

    await manager.broadcast(room_code, {
        "type": "GAME_STARTED",
        "data": _serialize_room_state(room, db),
    })
    return _serialize_room(room)


@router.get("/{room_code}/results", response_model=list)
def get_room_results(room_code: str, db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    results = []
    for player in db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all():
        results.append({
            "room_id": str(room.id),
            "user_id": str(player.user_id),
            "display_name": player.display_name,
            "final_score": player.score,
            "rank": None,
        })
    return results


@router.get("/{room_code}/chat", response_model=list)
def get_room_chat(room_code: str, db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return []
