from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel


class GameResult(BaseModel):
    """
    Game completion result - domain: GAME PLAY MANAGEMENT
    Final score and ranking snapshot after game finishes
    One result per user per game room
    """
    __tablename__ = "game_results"
    __table_args__ = (UniqueConstraint('room_id', 'user_id', name='uq_room_user_result'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("game_rooms.id"), nullable=False, index=True)  # No ondelete cascade - keep results when room deletes
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    final_score = Column(Integer)
    rank = Column(Integer)

    room = relationship("GameRoom", back_populates="game_results")
    user = relationship("User", back_populates="game_results")
