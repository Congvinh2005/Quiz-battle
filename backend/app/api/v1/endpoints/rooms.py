from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from typing import List

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.game.game_rooms import GameRoom
from app.models.game.room_players import RoomPlayer
from app.models.quiz.quizzes import Quiz
from app.models.user_auth.users import User

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


def _build_room_code() -> str:
    return uuid4().hex[:6].upper()


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_room(payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
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
def get_room(room_code: str, db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return _serialize_room(room)


@router.post("/{room_code}/join", response_model=dict)
def join_room(room_code: str, payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    display_name = payload.get("display_name")
    if not display_name:
        user = db.query(User).filter(User.id == current_user).first()
        display_name = user.username if user else "Player"

    existing = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user).first()
    if existing:
        existing.display_name = display_name
        db.commit()
        db.refresh(existing)
        return _serialize_player(existing)

    player = RoomPlayer(room_id=room.id, user_id=current_user, display_name=display_name, score=0)
    db.add(player)
    db.commit()
    db.refresh(player)
    return _serialize_player(player)


@router.post("/{room_code}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_room(room_code: str, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    player = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user).first()
    if player:
        db.delete(player)
        db.commit()
    return None


@router.get("/{room_code}/players", response_model=list)
def get_room_players(room_code: str, db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
    return [_serialize_player(player) for player in players]


@router.post("/{room_code}/start", response_model=dict)
def start_game(room_code: str, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    room.status = "PLAYING"
    db.commit()
    db.refresh(room)
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
