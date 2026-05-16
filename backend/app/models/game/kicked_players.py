from sqlalchemy import Column, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel


class KickedPlayer(BaseModel):
	"""
	Track kicked players - domain: GAME PLAY MANAGEMENT
	Links kicked user to room to prevent rejoin
	Composite key prevents duplicate kicks
	"""
	__tablename__ = "kicked_players"
	__table_args__ = (UniqueConstraint('room_id', 'user_id', name='uq_kicked_room_user'),)

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
	room_id = Column(UUID(as_uuid=True), ForeignKey("game_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
	kicked_at = Column(DateTime)

	room = relationship("GameRoom", back_populates="kicked_players")
	user = relationship("User", back_populates="kicked_players")
