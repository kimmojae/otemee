from pydantic import BaseModel


def mask_api_key(key: str | None) -> str | None:
    """API 키를 마스킹 (앞 8자 + ... + 뒤 4자)"""
    if not key:
        return None
    if len(key) <= 12:
        return "*" * len(key)
    return f"{key[:8]}...{key[-4:]}"


class SettingsUpdate(BaseModel):
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    google_api_key: str | None = None
    groq_api_key: str | None = None
    default_model: str | None = None


class SettingsResponse(BaseModel):
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    google_api_key: str | None = None
    groq_api_key: str | None = None
    default_model: str = "gemma3:1b"

    # Provider 활성화 여부 (API 키 존재 여부)
    openai_enabled: bool = False
    anthropic_enabled: bool = False
    google_enabled: bool = False
    groq_enabled: bool = False

    class Config:
        from_attributes = True
