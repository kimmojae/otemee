import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.chat import Chat, Message
from schemas.chat import ChatRequest
from services.llm import llm_service

router = APIRouter(prefix="/api")


@router.post("/chat")
async def chat(request: ChatRequest):
    """기존 스트리밍 채팅 (저장 없음) - 임시 채팅용"""

    async def generate():
        async for chunk in llm_service.stream(request.message, request.model):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/chat/{chat_id}")
async def chat_with_save(
    chat_id: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """스트리밍 채팅 + DB 저장"""
    # 채팅 존재 확인
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        # 채팅이 없으면 자동 생성
        chat = Chat(
            id=chat_id,
            title=request.message[:50],  # 첫 메시지로 제목 생성
            model=request.model,
        )
        db.add(chat)
        await db.commit()

    # 사용자 메시지 저장
    user_msg = Message(
        id=str(uuid.uuid4()),
        chat_id=chat_id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)
    await db.commit()

    # AI 응답 스트리밍 + 저장
    ai_content: list[str] = []

    async def generate():
        nonlocal ai_content
        async for chunk in llm_service.stream(request.message, request.model):
            ai_content.append(chunk)
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        # 스트리밍 완료 후 AI 메시지 저장
        ai_msg = Message(
            id=str(uuid.uuid4()),
            chat_id=chat_id,
            role="assistant",
            content="".join(ai_content),
        )
        db.add(ai_msg)

        # 채팅 updated_at 갱신
        chat.updated_at = datetime.utcnow()
        await db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
