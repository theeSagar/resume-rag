# app/agents/dispatcher.py
from app.agents.router import route_query
from app.agents.rag_agent import run_rag_agent
from app.agents.weather_agent import run_weather_agent
from app.agents.general_agent import run_general_agent

AGENT_MAP = {
    "resume": run_rag_agent,
    "weather": run_weather_agent,
    "general": run_general_agent,
}

async def handle_query(query: str) -> dict:
    category = await route_query(query)
    agent_fn = AGENT_MAP.get(category, run_general_agent)
    result = await agent_fn(query)
    return {"category": category, "answer": result["answer"], "chunks_used": result["chunks_used"]}