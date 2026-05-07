from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel

class RoomPlayer(BaseModel):
    __tablename__ = "room_players"
    __table_args__ = (UniqueConstraint('room_id', 'user_id', name='uq_room_user'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("game_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    display_name = Column(String(255))
    score = Column(Integer, default=0)

    room = relationship("GameRoom", back_populates="players")
    user = relationship("User", back_populates="room_players")
