"""In-memory conversation memory, one buffer per session."""
import threading
from collections import deque
from typing import Optional

from app.config import settings


class ConversationMemory:
    def __init__(self) -> None:
        self._history: dict[str, deque] = {}
        self._last_medicine: dict[str, str] = {}
        self._lock = threading.Lock()

    def add(self, session_id: str, role: str, content: str) -> None:
        with self._lock:
            buf = self._history.setdefault(session_id, deque(maxlen=settings.memory_turns * 2))
            buf.append((role, content))

    def history_text(self, session_id: str) -> str:
        with self._lock:
            buf = list(self._history.get(session_id, []))
        # Keep assistant turns short so the prompt stays small
        lines = [f"{role.capitalize()}: {content[:300]}" for role, content in buf]
        return "\n".join(lines)

    def set_last_medicine(self, session_id: str, name: str) -> None:
        with self._lock:
            self._last_medicine[session_id] = name

    def get_last_medicine(self, session_id: str) -> Optional[str]:
        with self._lock:
            return self._last_medicine.get(session_id)

    def clear(self, session_id: str) -> None:
        with self._lock:
            self._history.pop(session_id, None)
            self._last_medicine.pop(session_id, None)


memory = ConversationMemory()