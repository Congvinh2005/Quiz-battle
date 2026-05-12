from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
	def __init__(self) -> None:
		self.active_connections: Dict[str, Set[WebSocket]] = {}

	async def connect(self, room_code: str, websocket: WebSocket) -> None:
		await websocket.accept()
		self.active_connections.setdefault(room_code, set()).add(websocket)

	def disconnect(self, room_code: str, websocket: WebSocket) -> None:
		connections = self.active_connections.get(room_code)
		if not connections:
			return
		connections.discard(websocket)
		if not connections:
			self.active_connections.pop(room_code, None)

	async def broadcast(self, room_code: str, message: dict) -> None:
		connections = self.active_connections.get(room_code, set())
		for connection in list(connections):
			await connection.send_json(message)

