import asyncio
from uuid import UUID
from typing import Dict

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db, SessionLocal
from app.models.game.game_rooms import GameRoom
from app.models.game.room_players import RoomPlayer
from app.websockets.connection_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()
HOST_DISCONNECT_GRACE_SECONDS = 15
pending_room_close_tasks: Dict[str, asyncio.Task] = {}


def _serialize_player(player: RoomPlayer) -> dict:
    return {
        "id": str(player.id),
        "room_id": str(player.room_id),
        "user_id": str(player.user_id),
        "display_name": player.display_name,
        "score": player.score,
    }


def _serialize_room_state(room: GameRoom, db: Session) -> dict:
    players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
    return {
        "room_code": room.room_code,
        "host_id": str(room.host_id) if room.host_id else None,
        "players": [_serialize_player(player) for player in players],
        "player_count": len(players),
    }


def _cancel_pending_close_if_exists(room_code: str) -> None:
    task = pending_room_close_tasks.pop(room_code, None)
    if task and not task.done():
        task.cancel()


async def _close_room_if_host_not_reconnected(room_code: str, host_user_id: UUID) -> None:
    try:
        await asyncio.sleep(HOST_DISCONNECT_GRACE_SECONDS)

        # Host already reconnected within grace period.
        if manager.has_user_connection(room_code, str(host_user_id)):
            return

        db = SessionLocal()
        try:
            room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
            if not room:
                return

            # Keep active or finished games alive even if the host is offline.
            if room.status in ("PLAYING", "FINISHED"):
                return

            if room.host_id != host_user_id:
                return

            room_state = _serialize_room_state(room, db)
            await manager.broadcast(room_code, {
                "type": "ROOM_CLOSED",
                "data": {
                    **room_state,
                    "reason": "HOST_LEFT",
                    "message": "Host đã mất kết nối quá lâu, phòng đã đóng.",
                },
            })

            db.delete(room)
            db.commit()
        finally:
            db.close()
    except asyncio.CancelledError:
        # Host reconnected and pending close was cancelled.
        return
    finally:
        pending_room_close_tasks.pop(room_code, None)


@router.websocket("/ws/game/{room_code}")
async def game_socket(websocket: WebSocket, room_code: str, db: Session = Depends(get_db)):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401)
        return

    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        await websocket.close(code=4401)
        return

    try:
        current_user_id = UUID(payload["sub"])
    except ValueError:
        await websocket.close(code=4401)
        return

    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if room and room.host_id == current_user_id:
        _cancel_pending_close_if_exists(room_code)

    await manager.connect(room_code, str(current_user_id), websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(room_code, str(current_user_id), websocket)
        room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
        if not room:
            return

		# Active or finished games should continue even if the host disconnects.
        if room.status in ("PLAYING", "FINISHED"):
            return

        if room.host_id == current_user_id:
            if manager.has_user_connection(room_code, str(current_user_id)):
                return

            _cancel_pending_close_if_exists(room_code)
            pending_room_close_tasks[room_code] = asyncio.create_task(
                _close_room_if_host_not_reconnected(room_code, current_user_id)
            )
            return

