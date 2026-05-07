from sqlalchemy import Column, Boolean, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel

class PlayerAnswer(BaseModel):
    __tablename__ = "player_answers"
    __table_args__ = (UniqueConstraint('room_id', 'user_id', 'question_id', name='uq_room_user_question'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("game_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_id = Column(UUID(as_uuid=True), ForeignKey("answer_options.id"), index=True)
    is_correct = Column(Boolean)
    response_time = Column(Float)

    room = relationship("GameRoom", back_populates="player_answers")
    user = relationship("User", back_populates="player_answers")
    question = relationship("Question", back_populates="player_answers")
    selected_option = relationship("AnswerOption", back_populates="player_answers")
