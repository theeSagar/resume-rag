# app/schemas.py
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    # Real questions are ~100 chars; the cap stops oversized prompts from running up LLM costs.
    query: str = Field(min_length=1, max_length=1000)

class ChatResponse(BaseModel):
    answer: str
    source: str           # "resume" | "weather" | "general"
    chunks_used: int = 0