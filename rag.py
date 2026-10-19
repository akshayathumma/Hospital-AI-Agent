"""RAG pipeline: load_vector_database(), retrieve_documents(), generate_response()."""
import copy
import re
from typing import Optional

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.config import DISCLAIMER, settings
from app.services.data_service import repository
from app.services.ingest import ingest_data
from app.services.llm_service import llm_service
from app.services.vector_store import vector_store
from app.utils.cache import cache
from app.utils.logger import get_logger
from app.utils.prompt_loader import load_prompt

logger = get_logger(__name__)

_ready = False

_STOPWORDS = {
    "the", "for", "and", "you", "have", "has", "any", "are", "is", "do", "does",
    "what", "which", "can", "should", "how", "take", "tablet", "tablets", "medicine",
    "medicines", "drug", "drugs", "stock", "available", "alternative", "alternatives",
    "give", "tell", "about", "need", "want", "with", "some", "please", "there", "this",
    "that", "its", "dosage", "dose", "hrs", "of", "to", "me", "my", "i", "in", "on",
}


# --------------------------------------------------------------------------
# 1. load_vector_database
# --------------------------------------------------------------------------
def load_vector_database():
    """Load the CSV + ChromaDB collection; (re)build the index when out of date."""
    global _ready
    records = repository.load()
    collection = vector_store.load()
    if collection.count() != len(records):
        logger.info("Vector index out of date (%d vs %d) - rebuilding", collection.count(), len(records))
        ingest_data(reset=True, records=records)
    _ready = True
    return vector_store.load()


def reload_data() -> int:
    """Force a full reload of the CSV and rebuild of the vector index."""
    global _ready
    _ready = False
    cache.clear()
    records = repository.load()
    total = ingest_data(reset=True, records=records)
    _ready = True
    return total


def _ensure_ready() -> None:
    if not _ready:
        load_vector_database()


# --------------------------------------------------------------------------
# 2. retrieve_documents
# --------------------------------------------------------------------------
def _tokens(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in _STOPWORDS and len(t) > 2]


def _lexical_bonus(tokens: list[str], meta: dict) -> float:
    """Small bonus when a query term literally appears in name/use-case/brand."""
    haystack = f"{meta.get('name', '')} {meta.get('use_case', '')} {meta.get('alternatives', '')}".lower()
    hits = sum(1 for t in tokens if t in haystack)
    return min(0.3, 0.15 * hits)


def retrieve_documents(query: str, k: Optional[int] = None) -> list[dict]:
    """Semantic search over ChromaDB (with a light lexical re-rank).

    Returns a list of {"medicine": {...}, "document": str, "score": float}.
    """
    k = k or settings.top_k
    query = query.strip()
    if not query:
        return []

    cache_key = f"retrieve:{k}:{query.lower()}"
    cached = cache.get(cache_key)
    if cached is not None:
        return copy.deepcopy(cached)

    _ensure_ready()
    hits = vector_store.query(query, k=max(k * 2, 6))
    tokens = _tokens(query)

    ranked = []
    for hit in hits:
        bonus = _lexical_bonus(tokens, hit["metadata"])
        if hit["similarity"] < settings.min_similarity and bonus == 0:
            continue
        ranked.append((hit["similarity"] + bonus, hit))
    ranked.sort(key=lambda x: x[0], reverse=True)

    docs = []
    for score, hit in ranked[:k]:
        medicine = repository.get_by_id(int(hit["metadata"]["medicine_id"]))
        if medicine is None:
            continue
        docs.append({"medicine": medicine, "document": hit["document"], "score": round(min(score, 1.0), 3)})

    cache.set(cache_key, docs)
    return copy.deepcopy(docs)


def docs_to_medicines(docs: list[dict]) -> list[dict]:
    """Flatten retrieval docs into plain medicine dicts (with score)."""
    return [{**d["medicine"], "score": d.get("score")} for d in docs]


# --------------------------------------------------------------------------
# 3. generate_response
# --------------------------------------------------------------------------
def _format_context(docs: list[dict]) -> str:
    if not docs:
        return "No matching medicine was found in the inventory."
    blocks = []
    for d in docs:
        m = d["medicine"]
        blocks.append(
            f"Medicine: {m['name']}\n"
            f"Strength: {m['strength']}\n"
            f"Used for: {', '.join(m['use_case'])}\n"
            f"Stock: {m['stock_status']}\n"
            f"Dosage: {m['dosage']}\n"
            f"Alternative: {', '.join(m['alternatives']) or 'None'}"
        )
    return "\n\n".join(blocks)


def build_fallback_answer(docs: list[dict], note: str = "") -> str:
    """Deterministic answer used when the LLM is unavailable. No hallucination possible."""
    if not docs:
        body = (
            "I couldn't find a matching medicine in our inventory. "
            "Please check the spelling or ask the pharmacist for help."
        )
        return f"{body}\n\n{DISCLAIMER}"

    lines = []
    if note:
        lines.append(note + "\n")
    for d in docs[:3]:
        m = d["medicine"]
        stock_icon = "✅" if m["in_stock"] else "❌"
        lines.append(f"### 💊 {m['name']}")
        lines.append(f"- **Medicine:** {m['name']}")
        lines.append(f"- **Strength:** {m['strength']}")
        lines.append(f"- **Stock:** {stock_icon} {m['stock_status']}")
        lines.append(f"- **Dosage:** {m['dosage']}")
        lines.append(f"- **Alternative:** {', '.join(m['alternatives']) or 'None'}")
        if not m["in_stock"] and m["alternatives"]:
            lines.append(f"- **Suggestion:** Currently unavailable — ask the pharmacist about {', '.join(m['alternatives'])}.")
        lines.append("")
    lines.append(DISCLAIMER)
    return "\n".join(lines)


def generate_response(
    question: str,
    documents: list[dict],
    history: str = "",
    note: str = "",
) -> tuple[str, bool]:
    """Generate the final answer from retrieved context.

    Returns (answer, llm_used). Falls back to a template when Ollama is unavailable.
    """
    if not llm_service.is_available():
        return build_fallback_answer(documents, note), False

    try:
        prompt = ChatPromptTemplate.from_messages(
            [("system", load_prompt("rag_system")), ("human", "{question}")]
        )
        chain = prompt | llm_service.get_llm() | StrOutputParser()
        answer = chain.invoke(
            {
                "question": question,
                "context": _format_context(documents),
                "history": history or "(new conversation)",
                "note": note or "None",
                "disclaimer": DISCLAIMER,
            }
        ).strip()
        if not answer:
            raise ValueError("Empty LLM response")
        if "disclaimer" not in answer.lower():
            answer = f"{answer}\n\n{DISCLAIMER}"
        return answer, True
    except Exception as exc:
        logger.warning("LLM generation failed (%s) - using fallback answer", exc)
        return build_fallback_answer(documents, note), False