import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.chat import Chat, Message
from models.settings import Settings
from schemas.chat import ChatRequest
from services.llm import LLMServiceFactory

router = APIRouter(prefix="/api")

# 모델 ID -> Provider 매핑
MODEL_PROVIDER_MAP = {
    # OpenAI
    "gpt-4o": "openai",
    "gpt-4o-mini": "openai",
    "gpt-4-turbo": "openai",
    "gpt-3.5-turbo": "openai",
    # Anthropic
    "claude-sonnet-4-20250514": "anthropic",
    "claude-3-5-sonnet-20241022": "anthropic",
    "claude-3-5-haiku-20241022": "anthropic",
    "claude-3-opus-20240229": "anthropic",
    # Google
    "gemini-2.0-flash": "google",
    "gemini-1.5-pro": "google",
    "gemini-1.5-flash": "google",
    # Groq
    "llama-3.3-70b-versatile": "groq",
    "llama-3.1-8b-instant": "groq",
    "mixtral-8x7b-32768": "groq",
    "gemma2-9b-it": "groq",
}


def get_provider_from_model(model: str) -> str:
    """모델 ID에서 provider 추출"""
    return MODEL_PROVIDER_MAP.get(model, "ollama")


async def get_api_key_for_provider(db: AsyncSession, provider: str) -> str | None:
    """Provider에 해당하는 API 키 조회"""
    result = await db.execute(select(Settings).where(Settings.id == 1))
    settings = result.scalar_one_or_none()

    if not settings:
        return None

    key_map = {
        "openai": settings.openai_api_key,
        "anthropic": settings.anthropic_api_key,
        "google": settings.google_api_key,
        "groq": settings.groq_api_key,
    }
    return key_map.get(provider)


@router.post("/chat")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """기존 스트리밍 채팅 (저장 없음) - 임시 채팅용"""
    provider = get_provider_from_model(request.model)
    api_key = await get_api_key_for_provider(db, provider) if provider != "ollama" else None

    if provider != "ollama" and not api_key:
        raise HTTPException(status_code=400, detail=f"API key for {provider} is not configured")

    llm_service = LLMServiceFactory.create(provider, api_key)

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
    # Provider 및 API 키 확인
    provider = get_provider_from_model(request.model)
    api_key = await get_api_key_for_provider(db, provider) if provider != "ollama" else None

    if provider != "ollama" and not api_key:
        raise HTTPException(status_code=400, detail=f"API key for {provider} is not configured")

    llm_service = LLMServiceFactory.create(provider, api_key)

    # "new" 채팅인지 확인
    is_new_chat = chat_id == "new"
    actual_chat_id = chat_id

    if is_new_chat:
        # 새 채팅 생성
        actual_chat_id = str(uuid.uuid4())
        chat = Chat(
            id=actual_chat_id,
            title=request.message[:50],
            model=request.model,
        )
        db.add(chat)
        await db.commit()
    else:
        # 기존 채팅 조회
        result = await db.execute(select(Chat).where(Chat.id == chat_id))
        chat = result.scalar_one_or_none()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

    # 사용자 메시지 저장
    user_msg = Message(
        id=str(uuid.uuid4()),
        chat_id=actual_chat_id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)
    await db.commit()

    # AI 응답 스트리밍 + 저장
    ai_content: list[str] = []

    async def generate():
        nonlocal ai_content

        # 새 채팅이면 chat_created 이벤트 먼저 전송
        if is_new_chat:
            yield f"event: chat_created\ndata: {json.dumps({'chat_id': actual_chat_id})}\n\n"

        async for chunk in llm_service.stream(request.message, request.model):
            ai_content.append(chunk)
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        # 스트리밍 완료 후 AI 메시지 저장
        ai_msg = Message(
            id=str(uuid.uuid4()),
            chat_id=actual_chat_id,
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
