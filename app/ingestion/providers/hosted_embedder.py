# app/ingestion/providers/hosted_embedder.py
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import settings

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=30))
async def embed_batch(texts: list[str]) -> list[list[float]]:
    embeddings: list[list[float]] = []
    headers = {"Authorization": f"Bearer {settings.embed_api_key}"}

    async with httpx.AsyncClient(timeout=settings.embed_timeout_seconds) as client:
        for i in range(0, len(texts), settings.embed_batch_size):
            batch = texts[i : i + settings.embed_batch_size]
            resp = await client.post(
                f"{settings.embed_base_url}/embeddings",
                headers=headers,
                json={"model": settings.embed_model, "input": batch}
            )
            resp.raise_for_status()
            data = sorted(resp.json()["data"], key=lambda d: d["index"])
            embeddings.extend(d["embedding"] for d in data)

    return embeddings