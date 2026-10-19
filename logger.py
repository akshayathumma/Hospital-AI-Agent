"""Application-wide logging setup."""
import logging
import sys

from app.config import settings

_configured = False


def get_logger(name: str) -> logging.Logger:
    global _configured
    if not _configured:
        logging.basicConfig(
            level=getattr(logging, settings.log_level.upper(), logging.INFO),
            format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            stream=sys.stdout,
        )
        # Keep third-party libraries quiet
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("chromadb").setLevel(logging.WARNING)
        _configured = True
    return logging.getLogger(name)