from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="creator", cascade="all, delete-orphan")
    game_rooms = relationship("GameRoom", back_populates="host", cascade="all, delete-orphan")
    room_players = relationship("RoomPlayer", back_populates="user", cascade="all, delete-orphan")
    player_answers = relationship("PlayerAnswer", back_populates="user", cascade="all, delete-orphan")
    game_results = relationship("GameResult", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    user_stats = relationship("UserStats", back_populates="user", uselist=False, cascade="all, delete-orphan")

