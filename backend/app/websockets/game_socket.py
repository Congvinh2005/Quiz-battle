from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websockets.connection_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/game/{room_code}")
async def game_socket(websocket: WebSocket, room_code: str):
	await manager.connect(room_code, websocket)
	try:
		await manager.broadcast(room_code, {"type": "system", "message": f"Connected to room {room_code}"})
		while True:
			data = await websocket.receive_json()
			await manager.broadcast(room_code, {"type": "message", "room_code": room_code, "payload": data})
	except WebSocketDisconnect:
		manager.disconnect(room_code, websocket)
		await manager.broadcast(room_code, {"type": "system", "message": f"Disconnected from room {room_code}"})

