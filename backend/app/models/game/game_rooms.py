from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel


class GameRoom(BaseModel):
    """
    Game session container - domain: GAME PLAY MANAGEMENT
    Represents a multiplayer game session with status tracking and timestamps
    Lifecycle: WAITING → PLAYING → FINISHED
    """
    __tablename__ = "game_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_code = Column(String(10), unique=True, nullable=False, index=True)
    host_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="WAITING", nullable=False)
    max_players = Column(Integer, default=30, nullable=False)
    shuffle_questions = Column(Boolean, default=True, nullable=False)
    chat_enabled = Column(Boolean, default=True, nullable=False)
    current_question_order = Column(Integer, default=1)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)

    # Relationships
    host = relationship("User", back_populates="game_rooms")
    quiz = relationship("Quiz", back_populates="game_rooms")
    players = relationship("RoomPlayer", back_populates="room", cascade="all, delete-orphan")
    game_questions = relationship("GameQuestion", back_populates="room", cascade="all, delete-orphan")
    player_answers = relationship("PlayerAnswer", back_populates="room", cascade="all, delete-orphan")
    game_results = relationship("GameResult", back_populates="room")  # No cascade - keep results when room deletes
    chat_messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")
    kicked_players = relationship("KickedPlayer", back_populates="room", cascade="all, delete-orphan")
