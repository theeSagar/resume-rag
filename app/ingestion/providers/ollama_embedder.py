import requests
from app.config import settings

def embed(text: str) -> list[float]:
    response = requests.post(
        f"{settings.ollama_base_url}/api/embeddings",
        json={
            "model": settings.embedding_model_ollama,
            "prompt": text
        }
    )
    response.raise_for_status()  # throws if Ollama returns an error status
    data = response.json()
    return data["embedding"]