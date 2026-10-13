# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- LLM ---
    llm_base_url: str
    llm_api_key: str
    llm_model: str = "meta-llama/Llama-3.3-70B-Instruct"

    # --- Embeddings ---
    # embedding_provider: str = "ollama"      # "ollama" | "hosted"
    # embedding_model_ollama: str = "nomic-embed-text"
    # embedding_model_hosted: str = "text-embedding-3-small"
    # openai_api_key: str = ""
    # ollama_base_url: str = "http://localhost:11434"

    embed_base_url: str          # required: set in .env / host env vars, never hardcoded
    embed_api_key: str = ""
    embed_model: str = "BAAI/bge-large-en-v1.5"
    embed_batch_size: int = 64
    embed_timeout_seconds: int = 300

    chunk_size: int = 800
    chunk_overlap: int = 150
    retrieval_top_k: int = 8

    # --- Rate limiting for /chat (per visitor IP) ---
    rate_limit_per_minute: int = 5
    rate_limit_per_day: int = 50

    # --- Database ---
    database_url: str

    class Config:
        env_file = ".env"

settings = Settings()