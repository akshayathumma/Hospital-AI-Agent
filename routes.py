"""REST API endpoints."""
from fastapi import APIRouter

from app.config import settings
from app.models.schemas import (
    AlternativeResponse, ChatRequest, ChatResponse, DosageResponse, FAQRequest,
    FAQResponse, HealthResponse, MessageResponse, QueryRequest, ReloadResponse,
    SearchRequest, SearchResponse, StockResponse,
)
from app.services import medicine_tools as mt
from app.services.agent import agent
from app.services.data_service import repository
from app.services.llm_service import llm_service
from app.services.memory import memory
from app.services.rag import docs_to_medicines, generate_response, reload_data, retrieve_documents
from app.services.vector_store import vector_store
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        indexed = vector_store.count()
        status = "ok"
    except Exception as exc:
        logger.error("Health check: vector DB error: %s", exc)
        indexed, status = 0, "degraded"
    return HealthResponse(
        status=status,
        medicines_loaded=len(repository.all()),
        vectors_indexed=indexed,
        ollama_available=llm_service.is_available(force=True),
        model=settings.ollama_model,
    )


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    return ChatResponse(**agent.run(req.message, req.session_id))


@router.delete("/chat/{session_id}", response_model=MessageResponse)
def clear_chat(session_id: str) -> MessageResponse:
    memory.clear(session_id)
    return MessageResponse(status="ok", detail="Conversation memory cleared.")


@router.post("/search", response_model=SearchResponse)
def search(req: SearchRequest) -> SearchResponse:
    results = mt.search_medicines(req.query, top_k=req.top_k)
    return SearchResponse(query=req.query, count=len(results), results=results)


@router.post("/stock", response_model=StockResponse)
def stock(req: QueryRequest) -> StockResponse:
    return StockResponse(**mt.check_stock(req.query))


@router.post("/alternative", response_model=AlternativeResponse)
def alternative(req: QueryRequest) -> AlternativeResponse:
    return AlternativeResponse(**mt.suggest_alternatives(req.query))


@router.post("/dosage", response_model=DosageResponse)
def dosage(req: QueryRequest) -> DosageResponse:
    return DosageResponse(**mt.get_dosage(req.query))


@router.post("/faq", response_model=FAQResponse)
def faq(req: FAQRequest) -> FAQResponse:
    docs = retrieve_documents(req.question, k=3)
    answer, llm_used = generate_response(req.question, docs)
    return FAQResponse(
        question=req.question, answer=answer,
        medicines=docs_to_medicines(docs), llm_used=llm_used,
    )


@router.post("/reload-data", response_model=ReloadResponse)
def reload() -> ReloadResponse:
    total = reload_data()
    return ReloadResponse(status="reloaded", medicines_indexed=total)