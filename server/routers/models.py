import httpx
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.settings import Settings

router = APIRouter(prefix="/api")

OLLAMA_BASE_URL = "http://localhost:11434"

# 각 Provider별 지원 모델 목록
OPENAI_MODELS = [
    {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai"},
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai"},
    {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "openai"},
    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "openai"},
]

ANTHROPIC_MODELS = [
    {"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": "anthropic"},
    {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "provider": "anthropic"},
    {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "provider": "anthropic"},
    {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus", "provider": "anthropic"},
]

GOOGLE_MODELS = [
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "google"},
    {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "provider": "google"},
    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "provider": "google"},
]

GROQ_MODELS = [
    {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "provider": "groq"},
    {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B", "provider": "groq"},
    {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "provider": "groq"},
    {"id": "gemma2-9b-it", "name": "Gemma 2 9B", "provider": "groq"},
]


async def get_settings(db: AsyncSession) -> Settings | None:
    """설정 조회"""
    result = await db.execute(select(Settings).where(Settings.id == 1))
    return result.scalar_one_or_none()


@router.get("/models")
async def list_models(db: AsyncSession = Depends(get_db)):
    """모델 목록 조회 (Ollama + API 키가 설정된 Provider)"""
    models = []
    ollama_status = "running"  # "running" | "not_running"

    # 1. Ollama 모델 목록 조회
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                for model in data.get("models", []):
                    name = model.get("name", "")
                    size = model.get("size", 0)
                    size_gb = round(size / (1024 * 1024 * 1024), 1)

                    models.append(
                        {
                            "id": name,
                            "name": name,
                            "provider": "ollama",
                            "size": f"{size_gb}GB" if size_gb > 0 else None,
                        }
                    )
    except httpx.RequestError:
        ollama_status = "not_running"

    # 2. API 키가 설정된 Provider 모델 추가
    settings = await get_settings(db)
    if settings:
        if settings.openai_api_key:
            models.extend(OPENAI_MODELS)
        if settings.anthropic_api_key:
            models.extend(ANTHROPIC_MODELS)
        if settings.google_api_key:
            models.extend(GOOGLE_MODELS)
        if settings.groq_api_key:
            models.extend(GROQ_MODELS)

    return {"models": models, "ollama_status": ollama_status}
