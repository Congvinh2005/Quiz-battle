from sqlalchemy import Column, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.base_class import BaseModel

class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("game_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)

    room = relationship("GameRoom", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")
