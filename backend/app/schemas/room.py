from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ChatMessagePayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Hello everyone!"
            }
        }


class ChatMessageResponse(BaseModel):
    id: str
    room_id: str
    user_id: str
    message: str
    created_at: datetime
    updated_at: datetime
    user: dict

    class Config:
        from_attributes = True
