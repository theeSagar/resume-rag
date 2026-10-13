# app/agents/general_agent.py
from openai import AsyncOpenAI
from app.config import settings

llm_client = AsyncOpenAI(base_url=settings.llm_base_url, api_key=settings.llm_api_key)

async def run_general_agent(query: str) -> dict:
    response = await llm_client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "user", "content": query}]
    )
    return {"answer": response.choices[0].message.content, "chunks_used": 0}