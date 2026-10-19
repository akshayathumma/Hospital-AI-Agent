"""Thin wrapper around a persistent ChromaDB collection."""
import threading
from pathlib import Path
from typing import Any, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.utils import embedding_functions

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VectorStore:
    def __init__(self) -> None:
        self._client: Optional[Any] = None
        self._collection: Optional[Any] = None
        self._embedding_fn: Optional[Any] = None
        self._lock = threading.RLock()

    def _get_embedding_fn(self):
        if self._embedding_fn is None:
            logger.info("Loading embedding model: %s", settings.embedding_model)
            self._embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=settings.embedding_model
            )
        return self._embedding_fn

    def _get_client(self):
        if self._client is None:
            Path(settings.chroma_dir).mkdir(parents=True, exist_ok=True)
            self._client = chromadb.PersistentClient(
                path=str(settings.chroma_dir),
                settings=ChromaSettings(anonymized_telemetry=False),
            )
        return self._client

    def load(self):
        """Open (or create) the collection."""
        with self._lock:
            if self._collection is None:
                self._collection = self._get_client().get_or_create_collection(
                    name=settings.collection_name,
                    embedding_function=self._get_embedding_fn(),
                    metadata={"hnsw:space": "cosine"},
                )
            return self._collection

    def reset(self):
        """Drop and recreate the collection."""
        with self._lock:
            client = self._get_client()
            try:
                client.delete_collection(settings.collection_name)
            except Exception:  # collection may not exist yet
                pass
            self._collection = None
            return self.load()

    def count(self) -> int:
        return self.load().count()

    def add(self, ids: list[str], documents: list[str], metadatas: list[dict]) -> None:
        self.load().add(ids=ids, documents=documents, metadatas=metadatas)

    def query(self, text: str, k: int) -> list[dict]:
        collection = self.load()
        total = collection.count()
        if total == 0:
            return []
        result = collection.query(
            query_texts=[text],
            n_results=min(k, total),
            include=["documents", "metadatas", "distances"],
        )
        hits = []
        for doc, meta, dist in zip(
            result["documents"][0], result["metadatas"][0], result["distances"][0]
        ):
            hits.append(
                {
                    "document": doc,
                    "metadata": meta,
                    "similarity": round(1.0 - float(dist), 4),  # cosine similarity
                }
            )
        return hits


vector_store = VectorStore()