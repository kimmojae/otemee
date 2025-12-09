import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.chat import Chat, Message
from schemas.chat import (
    ChatCreate,
    ChatDetailResponse,
    ChatResponse,
    ChatUpdate,
)

router = APIRouter(prefix="/api/chats", tags=["chats"])


@router.get("", response_model=list[ChatResponse])
async def list_chats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Chat).order_by(Chat.updated_at.desc()))
    return result.scalars().all()


@router.post("", response_model=ChatResponse)
async def create_chat(chat: ChatCreate, db: AsyncSession = Depends(get_db)):
    new_chat = Chat(id=str(uuid.uuid4()), **chat.model_dump())
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)
    return new_chat


@router.get("/{chat_id}", response_model=ChatDetailResponse)
async def get_chat(chat_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Chat)
        .where(Chat.id == chat_id)
        .options(selectinload(Chat.messages))
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    await db.delete(chat)
    await db.commit()
    return {"status": "deleted"}


@router.patch("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: str, update: ChatUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = update.title
    await db.commit()
    await db.refresh(chat)
    return chat
