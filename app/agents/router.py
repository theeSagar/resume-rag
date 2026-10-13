# app/agents/router.py
import json
from openai import AsyncOpenAI
from app.config import settings

llm_client = AsyncOpenAI(
    base_url=settings.llm_base_url,
    api_key=settings.llm_api_key
)

ROUTER_SYSTEM_PROMPT = """You are a router. Classify the user's query into exactly one category:
- "resume" -> questions about Sagar's work experience, skills, projects, education, certifications, achievements, awards, strengths, or whether/why to hire him
- "weather" -> questions about weather, temperature, forecast in a location
- "general" -> greetings, small talk, anything else

Respond ONLY with valid JSON, no other text:
{"category": "resume" | "weather" | "general"}
"""

async def route_query(query: str) -> str:
    try:
        response = await llm_client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ],
            temperature=0
        )
        raw = response.choices[0].message.content.strip()
        parsed = json.loads(raw)
        return parsed.get("category", "general")
    except (json.JSONDecodeError, KeyError):
        return "general"   # safe fallback if the LLM misbehaves