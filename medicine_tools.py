"""Pure business-logic functions behind the five agent tools and REST endpoints."""
from typing import Optional

from app.config import settings
from app.services.data_service import repository
from app.services.rag import docs_to_medicines, retrieve_documents


def _resolve(query: str) -> tuple[Optional[dict], Optional[str]]:
    """Resolve a query to one medicine: exact/brand/typo match first, then semantic."""
    record, via = repository.find_in_text(query)
    if record:
        return record, via
    docs = retrieve_documents(query, k=1)
    if docs and docs[0]["score"] >= settings.resolve_similarity:
        return {**docs[0]["medicine"], "score": docs[0]["score"]}, "semantic"
    return None, None


def search_medicines(query: str, top_k: int = 3) -> list[dict]:
    """Medicine Search Tool - semantic search by name, symptom or use case."""
    return docs_to_medicines(retrieve_documents(query, k=top_k))


def check_stock(query: str) -> dict:
    """Stock Checker Tool."""
    med, _ = _resolve(query)
    if not med:
        return {
            "query": query, "found": False, "in_stock": None, "status": "Not Found",
            "medicine": None, "alternatives": [],
            "message": "I couldn't find that medicine in our inventory.",
        }
    if med["in_stock"]:
        message = f"{med['name']} {med['strength']} is available in stock."
    else:
        alts = ", ".join(med["alternatives"]) or "none listed"
        message = f"{med['name']} {med['strength']} is currently out of stock. Alternatives: {alts}."
    return {
        "query": query, "found": True, "in_stock": med["in_stock"],
        "status": med["stock_status"], "medicine": med,
        "alternatives": med["alternatives"], "message": message,
    }


def suggest_alternatives(query: str) -> dict:
    """Alternative Suggestion Tool."""
    med, via = _resolve(query)
    if not med:
        return {
            "query": query, "found": False, "medicine": None, "alternatives": [],
            "message": "I couldn't find that medicine in our inventory.",
        }
    alts = med["alternatives"]
    message = (
        f"Alternatives to {med['name']} {med['strength']}: {', '.join(alts)}."
        if alts else f"No alternatives are listed for {med['name']}."
    )
    if via == "brand":
        message = f"'{query.strip()}' is a brand name linked to {med['name']}. " + message
    message += " Always ask the pharmacist or doctor before switching medicines."
    return {"query": query, "found": True, "medicine": med, "alternatives": alts, "message": message}


def get_dosage(query: str) -> dict:
    """Dosage Tool."""
    med, _ = _resolve(query)
    if not med:
        return {
            "query": query, "found": False, "medicine": None, "dosage": None,
            "message": "I couldn't find that medicine in our inventory.",
        }
    message = f"{med['name']} {med['strength']}: {med['dosage']}."
    if med["dosage"].strip().lower() == "as prescribed":
        message += " The dose must be set by your doctor."
    return {"query": query, "found": True, "medicine": med, "dosage": med["dosage"], "message": message}


def answer_faq(question: str) -> list[dict]:
    """FAQ Tool - retrieves the medicines most relevant to a general question."""
    return docs_to_medicines(retrieve_documents(question, k=3))