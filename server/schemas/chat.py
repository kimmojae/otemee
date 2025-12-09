from datetime import datetime

from pydantic import BaseModel


# 기존 - 스트리밍 채팅용
class ChatRequest(BaseModel):
    message: str
    model: str = "gemma3:1b"


class ChatMessage(BaseModel):
    role: str
    content: str


# CRUD용 스키마
class MessageCreate(BaseModel):
    role: str
    content: str


class MessageResponse(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    title: str
    model: str = "gemma3:1b"


class ChatUpdate(BaseModel):
    title: str


class ChatResponse(BaseModel):
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatDetailResponse(ChatResponse):
    messages: list[MessageResponse] = []
