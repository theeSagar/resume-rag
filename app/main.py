# app/main.py
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy import text

from app.schemas import ChatRequest, ChatResponse
from app.agents.dispatcher import handle_query
from app.db.database import engine
from app.rate_limit import enforce_chat_rate_limit


@asynccontextmanager
async def lifespan(app: FastAPI):
    # The first connection to Neon can take a minute (cold start + TLS); pay it at boot,
    # not on a visitor's first question, which would hit the frontend's 60s timeout.
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    yield


app = FastAPI(title="Resume RAG Bot", lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(enforce_chat_rate_limit)])
async def chat(request: ChatRequest):
    result = await handle_query(request.query)
    return ChatResponse(
        answer=result["answer"],
        source=result["category"],
        chunks_used=result["chunks_used"]
    )