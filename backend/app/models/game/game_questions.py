from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel


class GameQuestion(BaseModel):
    """
    Question sequence in game room - domain: GAME PLAY MANAGEMENT
    Maps abstract questions to specific game instance with ordering
    Prevents duplicate question_order per room
    """
    __tablename__ = "game_questions"
    __table_args__ = (UniqueConstraint('room_id', 'question_order', name='uq_room_question_order'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("game_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)

    room = relationship("GameRoom", back_populates="game_questions")
    question = relationship("Question", back_populates="game_questions")
