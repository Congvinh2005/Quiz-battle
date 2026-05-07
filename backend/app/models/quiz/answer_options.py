from sqlalchemy import Column, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel

class AnswerOption(BaseModel):
    __tablename__ = "answer_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)

    question = relationship("Question", back_populates="answer_options")
    player_answers = relationship("PlayerAnswer", back_populates="selected_option")
