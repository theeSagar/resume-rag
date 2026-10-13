# from app.config import settings                              # not ..config
# from app.ingestion.providers import ollama_embedder, hosted_embedder  # not .providers

# EMBEDDING_DIM = {
#     "ollama": 768,
#     "hosted": 1536,
# }

# def get_embedder():
#     provider = settings.embedding_provider

#     if provider == "ollama":
#         return ollama_embedder.embed, EMBEDDING_DIM["ollama"]
#     elif provider == "hosted":
#         return hosted_embedder.embed, EMBEDDING_DIM["hosted"]
#     else:
#         raise ValueError(f"Unknown embedding provider: {provider}")

from app.ingestion.providers.hosted_embedder import embed_batch

EMBEDDING_DIM = 1024   # BGE-large-en-v1.5 — we'll confirm this by testing

async def embed_texts(texts: list[str]) -> list[list[float]]:
    return await embed_batch(texts)