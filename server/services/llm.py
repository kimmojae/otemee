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


class LLMServiceFactory:
    @staticmethod
    def create(provider: str = "ollama") -> BaseLLMService:
        if provider == "ollama":
            return OllamaService()
        raise ValueError(f"Unknown provider: {provider}")


llm_service = LLMServiceFactory.create("ollama")
