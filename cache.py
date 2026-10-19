"""Tiny thread-safe in-memory TTL cache."""
import threading
import time
from typing import Any, Optional

from app.config import settings


class TTLCache:
    def __init__(self, ttl_seconds: int = 300, max_items: int = 512) -> None:
        self.ttl = ttl_seconds
        self.max_items = max_items
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return None
            expires_at, value = item
            if expires_at < time.time():
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            if len(self._store) >= self.max_items:
                oldest = min(self._store, key=lambda k: self._store[k][0])
                del self._store[oldest]
            self._store[key] = (time.time() + self.ttl, value)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()


cache = TTLCache(ttl_seconds=settings.cache_ttl_seconds)