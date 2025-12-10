from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers.chat import router as chat_router
from routers.chats import router as chats_router
from routers.models import router as models_router
from routers.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 DB 테이블 생성
    await init_db()
    yield


app = FastAPI(title="Otemee Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(chats_router)
app.include_router(models_router)
app.include_router(settings_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
