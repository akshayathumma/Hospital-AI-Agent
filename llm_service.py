"""Ollama / Mistral access through LangChain."""
import threading
import time
from typing import Optional

import httpx
from langchain_ollama import ChatOllama

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class LLMService:
    def __init__(self) -> None:
        self._llm: Optional[ChatOllama] = None
        self._lock = threading.Lock()
        self._last_check = 0.0
        self._last_ok = False

    def get_llm(self) -> ChatOllama:
        if self._llm is None:
            with self._lock:
                if self._llm is None:
                    self._llm = ChatOllama(
                        model=settings.ollama_model,
                        base_url=settings.ollama_base_url,
                        temperature=settings.llm_temperature,
                        client_kwargs={"timeout": settings.ollama_timeout},
                    )
        return self._llm

    def is_available(self, force: bool = False) -> bool:
        """True when Ollama is reachable AND the configured model is pulled.

        The result is cached for 15 seconds so we don't ping on every request.
        """
        now = time.time()
        if not force and now - self._last_check < 15:
            return self._last_ok
        ok = False
        try:
            resp = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=2.0)
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                ok = any(m.get("name", "").startswith(settings.ollama_model) for m in models)
                if not ok:
                    logger.warning(
                        "Ollama is running but model '%s' is not pulled. "
                        "Run: ollama pull %s", settings.ollama_model, settings.ollama_model,
                    )
        except Exception:
            ok = False
        if ok != self._last_ok or self._last_check == 0.0:
            logger.info("Ollama available: %s", ok)
        self._last_ok = ok
        self._last_check = now
        return ok


llm_service = LLMService()