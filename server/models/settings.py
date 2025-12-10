from sqlalchemy import Column, Integer, String

from database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)
    openai_api_key = Column(String, nullable=True)
    anthropic_api_key = Column(String, nullable=True)
    google_api_key = Column(String, nullable=True)
    groq_api_key = Column(String, nullable=True)
    default_model = Column(String, default="gemma3:1b")
