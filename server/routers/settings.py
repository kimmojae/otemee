from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.settings import Settings
from schemas.settings import SettingsResponse, SettingsUpdate, mask_api_key

router = APIRouter(prefix="/api")


async def get_or_create_settings(db: AsyncSession) -> Settings:
    """설정을 조회하거나 없으면 생성"""
    result = await db.execute(select(Settings).where(Settings.id == 1))
    settings = result.scalar_one_or_none()

    if not settings:
        settings = Settings(id=1)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)

    return settings


@router.get("/settings", response_model=SettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    """설정 조회 (API 키는 마스킹)"""
    settings = await get_or_create_settings(db)

    return SettingsResponse(
        openai_api_key=mask_api_key(settings.openai_api_key),
        anthropic_api_key=mask_api_key(settings.anthropic_api_key),
        google_api_key=mask_api_key(settings.google_api_key),
        groq_api_key=mask_api_key(settings.groq_api_key),
        default_model=settings.default_model or "gemma3:1b",
        openai_enabled=bool(settings.openai_api_key),
        anthropic_enabled=bool(settings.anthropic_api_key),
        google_enabled=bool(settings.google_api_key),
        groq_enabled=bool(settings.groq_api_key),
    )


@router.patch("/settings", response_model=SettingsResponse)
async def update_settings(
    data: SettingsUpdate, db: AsyncSession = Depends(get_db)
):
    """설정 업데이트"""
    settings = await get_or_create_settings(db)

    # None이 아닌 값만 업데이트
    if data.openai_api_key is not None:
        # 빈 문자열이면 키 삭제, 아니면 업데이트
        settings.openai_api_key = data.openai_api_key if data.openai_api_key else None

    if data.anthropic_api_key is not None:
        settings.anthropic_api_key = (
            data.anthropic_api_key if data.anthropic_api_key else None
        )

    if data.google_api_key is not None:
        settings.google_api_key = data.google_api_key if data.google_api_key else None

    if data.groq_api_key is not None:
        settings.groq_api_key = data.groq_api_key if data.groq_api_key else None

    if data.default_model is not None:
        settings.default_model = data.default_model

    await db.commit()
    await db.refresh(settings)

    return SettingsResponse(
        openai_api_key=mask_api_key(settings.openai_api_key),
        anthropic_api_key=mask_api_key(settings.anthropic_api_key),
        google_api_key=mask_api_key(settings.google_api_key),
        groq_api_key=mask_api_key(settings.groq_api_key),
        default_model=settings.default_model or "gemma3:1b",
        openai_enabled=bool(settings.openai_api_key),
        anthropic_enabled=bool(settings.anthropic_api_key),
        google_enabled=bool(settings.google_api_key),
        groq_enabled=bool(settings.groq_api_key),
    )
