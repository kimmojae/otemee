from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator

from langchain_core.messages import HumanMessage
from langchain_ollama import ChatOllama


class BaseLLMService(ABC):
    @abstractmethod
    async def stream(self, message: str, model: str) -> AsyncGenerator[str, None]:
        pass


class OllamaService(BaseLLMService):
    async def stream(
        self, message: str, model: str = "gemma3:1b"
    ) -> AsyncGenerator[str, None]:
        llm = ChatOllama(model=model)
        async for chunk in llm.astream([HumanMessage(content=message)]):
            if chunk.content:
                yield chunk.content


class OpenAIService(BaseLLMService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def stream(
        self, message: str, model: str = "gpt-4o-mini"
    ) -> AsyncGenerator[str, None]:
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(model=model, api_key=self.api_key, streaming=True)
        async for chunk in llm.astream([HumanMessage(content=message)]):
            if chunk.content:
                yield chunk.content


class AnthropicService(BaseLLMService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def stream(
        self, message: str, model: str = "claude-3-5-sonnet-20241022"
    ) -> AsyncGenerator[str, None]:
        from langchain_anthropic import ChatAnthropic

        llm = ChatAnthropic(model=model, api_key=self.api_key, streaming=True)
        async for chunk in llm.astream([HumanMessage(content=message)]):
            if chunk.content:
                yield chunk.content


class GoogleService(BaseLLMService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def stream(
        self, message: str, model: str = "gemini-1.5-flash"
    ) -> AsyncGenerator[str, None]:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(
            model=model, google_api_key=self.api_key, streaming=True
        )
        async for chunk in llm.astream([HumanMessage(content=message)]):
            if chunk.content:
                yield chunk.content


class GroqService(BaseLLMService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def stream(
        self, message: str, model: str = "llama-3.3-70b-versatile"
    ) -> AsyncGenerator[str, None]:
        from langchain_groq import ChatGroq

        llm = ChatGroq(model=model, api_key=self.api_key, streaming=True)
        async for chunk in llm.astream([HumanMessage(content=message)]):
            if chunk.content:
                yield chunk.content


class LLMServiceFactory:
    @staticmethod
    def create(provider: str = "ollama", api_key: str | None = None) -> BaseLLMService:
        if provider == "ollama":
            return OllamaService()
        elif provider == "openai":
            if not api_key:
                raise ValueError("OpenAI API key is required")
            return OpenAIService(api_key)
        elif provider == "anthropic":
            if not api_key:
                raise ValueError("Anthropic API key is required")
            return AnthropicService(api_key)
        elif provider == "google":
            if not api_key:
                raise ValueError("Google API key is required")
            return GoogleService(api_key)
        elif provider == "groq":
            if not api_key:
                raise ValueError("Groq API key is required")
            return GroqService(api_key)
        raise ValueError(f"Unknown provider: {provider}")
