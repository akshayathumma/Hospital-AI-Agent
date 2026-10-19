"""Central configuration loaded from environment variables / .env file."""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent  # -> backend/

DISCLAIMER = (
    "⚠️ Medical Disclaimer: This information is for general guidance only and is "
    "not a substitute for professional medical advice. Please consult a qualified "
    "doctor or pharmacist before taking any medicine."
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    app_name: str = "Hospital AI Agent"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # LLM (Ollama)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"
    ollama_timeout: int = 120
    llm_temperature: float = 0.1

    # Embeddings / vector DB
    embedding_model: str = "all-MiniLM-L6-v2"
    chroma_dir: Path = BASE_DIR / "vector_db"
    collection_name: str = "medicines"
    data_path: Path = BASE_DIR / "data" / "medicines.csv"

    # Retrieval
    top_k: int = 3
    min_similarity: float = 0.2
    resolve_similarity: float = 0.3
    cache_ttl_seconds: int = 300

    # Agent
    memory_turns: int = 6
    agent_routing: str = "llm"  # "llm" or "heuristic"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()