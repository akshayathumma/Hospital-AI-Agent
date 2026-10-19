"""Pydantic request / response models."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.config import DISCLAIMER


class Medicine(BaseModel):
    id: int
    name: str
    strength: str
    use_case: list[str]
    alternatives: list[str]
    in_stock: bool
    stock_status: str
    dosage: str
    score: Optional[float] = None


# ----------------------------- requests -----------------------------
class _Base(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class ChatRequest(_Base):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = Field(default=None, max_length=100)


class QueryRequest(_Base):
    query: str = Field(..., min_length=1, max_length=300)


class SearchRequest(QueryRequest):
    top_k: int = Field(default=5, ge=1, le=10)


class FAQRequest(_Base):
    question: str = Field(..., min_length=1, max_length=300)


# ----------------------------- responses -----------------------------
class ChatResponse(BaseModel):
    answer: str
    tool_used: str
    medicines: list[Medicine] = []
    session_id: str
    llm_used: bool
    disclaimer: str = DISCLAIMER


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[Medicine]


class StockResponse(BaseModel):
    query: str
    found: bool
    in_stock: Optional[bool] = None
    status: str
    medicine: Optional[Medicine] = None
    alternatives: list[str] = []
    message: str


class AlternativeResponse(BaseModel):
    query: str
    found: bool
    medicine: Optional[Medicine] = None
    alternatives: list[str] = []
    message: str


class DosageResponse(BaseModel):
    query: str
    found: bool
    medicine: Optional[Medicine] = None
    dosage: Optional[str] = None
    message: str
    disclaimer: str = DISCLAIMER


class FAQResponse(BaseModel):
    question: str
    answer: str
    medicines: list[Medicine] = []
    llm_used: bool


class HealthResponse(BaseModel):
    status: str
    medicines_loaded: int
    vectors_indexed: int
    ollama_available: bool
    model: str


class ReloadResponse(BaseModel):
    status: str
    medicines_indexed: int


class MessageResponse(BaseModel):
    status: str
    detail: str