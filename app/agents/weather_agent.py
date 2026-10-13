# app/agents/weather_agent.py
import json
import httpx
from openai import AsyncOpenAI
from app.config import settings

llm_client = AsyncOpenAI(base_url=settings.llm_base_url, api_key=settings.llm_api_key)

async def get_weather(city: str) -> dict:
    async with httpx.AsyncClient() as client:
        geo_resp = await client.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": city, "count": 1}
        )
        geo_data = geo_resp.json()
        if not geo_data.get("results"):
            return {"error": f"Could not find location: {city}"}

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]

        weather_resp = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": lat, "longitude": lon, "current_weather": True}
        )
        return weather_resp.json()

TOOLS = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"]
        }
    }
}]

async def run_weather_agent(query: str) -> dict:
    response = await llm_client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "user", "content": query}],
        tools=TOOLS,
        tool_choice="auto"
    )
    msg = response.choices[0].message

    if not msg.tool_calls:
        return {"answer": msg.content or "I couldn't determine the location for that.", "chunks_used": 0}

    call = msg.tool_calls[0]
    args = json.loads(call.function.arguments)
    weather_data = await get_weather(args["city"])

    follow_up = await llm_client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "user", "content": query},
            msg,
            {"role": "tool", "tool_call_id": call.id, "content": json.dumps(weather_data)}
        ]
    )
    return {"answer": follow_up.choices[0].message.content, "chunks_used": 0}