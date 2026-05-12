from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel


class Question(BaseModel):
    """
    Quiz question - domain: QUIZ CONTENT MANAGEMENT
    Individual question with metadata (time limit, points, order)
    """
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    question_type = Column(String(20), nullable=False)
    time_limit = Column(Integer)
    points = Column(Integer, default=100)
    order_index = Column(Integer)

    quiz = relationship("Quiz", back_populates="questions")
    answer_options = relationship("AnswerOption", back_populates="question", cascade="all, delete-orphan")
    player_answers = relationship("PlayerAnswer", back_populates="question", cascade="all, delete-orphan")
    game_questions = relationship("GameQuestion", back_populates="question", cascade="all, delete-orphan")
