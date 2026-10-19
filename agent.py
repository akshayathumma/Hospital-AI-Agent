"""LangChain-based medicine agent: the LLM decides which tool to call."""
import json
import re
import uuid
from typing import Optional

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool

from app.config import DISCLAIMER, settings
from app.services import medicine_tools as mt
from app.services.data_service import repository
from app.services.llm_service import llm_service
from app.services.memory import memory
from app.services.rag import generate_response
from app.utils.logger import get_logger
from app.utils.prompt_loader import load_prompt

logger = get_logger(__name__)


# ------------------------------ LangChain tools ------------------------------
def _pack(medicines: list[dict], note: str = "") -> str:
    return json.dumps({"medicines": medicines, "note": note})


@tool("medicine_search")
def medicine_search_tool(query: str) -> str:
    """Search medicines semantically by name, symptom or use case."""
    results = mt.search_medicines(query, top_k=settings.top_k)
    return _pack(results, "" if results else "No medicine matched the query.")


@tool("stock_checker")
def stock_checker_tool(query: str) -> str:
    """Check whether a medicine is in stock."""
    res = mt.check_stock(query)
    return _pack([res["medicine"]] if res["found"] else [], res["message"])


@tool("alternative_suggestion")
def alternative_suggestion_tool(query: str) -> str:
    """Suggest alternatives for a medicine."""
    res = mt.suggest_alternatives(query)
    return _pack([res["medicine"]] if res["found"] else [], res["message"])


@tool("dosage")
def dosage_tool(query: str) -> str:
    """Explain how to take a medicine (dosage instructions)."""
    res = mt.get_dosage(query)
    return _pack([res["medicine"]] if res["found"] else [], res["message"])


@tool("faq")
def faq_tool(query: str) -> str:
    """Answer general medicine FAQs such as 'medicine for fever?'."""
    results = mt.answer_faq(query)
    return _pack(results, "" if results else "No medicine matched the question.")


TOOLS = {t.name: t for t in [
    medicine_search_tool, stock_checker_tool, alternative_suggestion_tool, dosage_tool, faq_tool,
]}

# ------------------------------ Heuristic router ------------------------------
_PATTERNS = [
    ("alternative_suggestion", r"\b(alternative|alternatives|substitute|substitutes|replacement|instead of|replace|other option)\b"),
    ("dosage", r"\b(dosage|dose|how (should|do|to|many|often|much)|when (should|to) (i )?take|take it)\b"),
    ("faq", r"\b(medicine|medicines|tablet|tablets|drug|drugs|something|treatment)\s+(for|to treat)\b|\bwhat can i (take|use)\b|\bwhich (medicine|tablet)\b"),
    ("stock_checker", r"\b(stock|in stock|available|availability|do you have|have you got|out of stock)\b"),
]
_GREETING = re.compile(r"^\s*(hi|hello|hey|good (morning|afternoon|evening)|thanks|thank you)\b[\s!.?]*$", re.I)
_PRONOUN = re.compile(r"\b(it|its|this|that|them|those)\b", re.I)


def _heuristic_tool(message: str) -> str:
    lowered = message.lower()
    for name, pattern in _PATTERNS:
        if re.search(pattern, lowered):
            return name
    return "medicine_search"


class MedicineAgent:
    def _route_with_llm(self, message: str, history: str) -> tuple[str, str]:
        prompt = ChatPromptTemplate.from_messages(
            [("system", load_prompt("router_system")), ("human", "{question}")]
        )
        chain = prompt | llm_service.get_llm() | StrOutputParser()
        raw = chain.invoke({"question": message, "history": history or "(none)"})
        match = re.search(r"\{.*?\}", raw, re.S)
        if not match:
            raise ValueError(f"Router returned no JSON: {raw!r}")
        data = json.loads(match.group(0))
        tool_name = data.get("tool")
        if tool_name not in TOOLS:
            raise ValueError(f"Router chose unknown tool: {tool_name!r}")
        return tool_name, str(data.get("query") or message)

    def _route(self, message: str, history: str) -> tuple[str, str]:
        if settings.agent_routing == "llm" and llm_service.is_available():
            try:
                return self._route_with_llm(message, history)
            except Exception as exc:
                logger.warning("LLM routing failed (%s) - using heuristic router", exc)
        return _heuristic_tool(message), message

    def _with_context(self, query: str, message: str, session_id: str) -> str:
        """Resolve follow-ups like 'what about its dosage?' using the last medicine."""
        record, _ = repository.find_in_text(query)
        if record is None and _PRONOUN.search(message):
            last = memory.get_last_medicine(session_id)
            if last:
                return f"{query} {last}"
        return query

    def run(self, message: str, session_id: Optional[str] = None) -> dict:
        session_id = session_id or str(uuid.uuid4())

        if _GREETING.match(message):
            answer = (
                "Hello! 👋 I'm **MediAssist**. I can search medicines, check stock, "
                "suggest alternatives and explain dosage instructions. Try *\"Medicine for fever\"* "
                "or *\"Is Insulin available?\"*.\n\n" + DISCLAIMER
            )
            memory.add(session_id, "user", message)
            memory.add(session_id, "assistant", answer)
            return {"answer": answer, "tool_used": "none", "medicines": [], "session_id": session_id, "llm_used": False}

        history = memory.history_text(session_id)
        tool_name, query = self._route(message, history)
        query = self._with_context(query, message, session_id)
        logger.info("Agent routed '%s' -> %s (query=%r)", message, tool_name, query)

        payload = json.loads(TOOLS[tool_name].invoke({"query": query}))
        medicines = payload["medicines"]
        docs = [{"medicine": {k: v for k, v in m.items() if k != "score"}, "score": m.get("score")} for m in medicines]

        answer, llm_used = generate_response(message, docs, history=history, note=payload.get("note", ""))

        memory.add(session_id, "user", message)
        memory.add(session_id, "assistant", answer)
        if medicines:
            memory.set_last_medicine(session_id, medicines[0]["name"])

        return {
            "answer": answer, "tool_used": tool_name, "medicines": medicines,
            "session_id": session_id, "llm_used": llm_used,
        }


agent = MedicineAgent()