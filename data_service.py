"""CSV-backed medicine repository used for exact / structured lookups."""
import copy
import re
import threading
from difflib import get_close_matches
from pathlib import Path
from typing import Optional

import pandas as pd

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

REQUIRED_COLUMNS = [
    "Medicine_ID",
    "Medicine_Name",
    "Strength",
    "Use_Case",
    "Alternative",
    "Stock",
    "Dosage_Instruction",
]


def _split(value: str) -> list[str]:
    return [p.strip() for p in str(value).split(",") if p.strip()]


def _to_record(row: pd.Series) -> dict:
    in_stock = str(row["Stock"]).strip().lower() in {"yes", "y", "true", "1", "available"}
    return {
        "id": int(row["Medicine_ID"]),
        "name": str(row["Medicine_Name"]).strip(),
        "strength": str(row["Strength"]).strip(),
        "use_case": _split(row["Use_Case"]),
        "alternatives": _split(row["Alternative"]),
        "in_stock": in_stock,
        "stock_status": "Available" if in_stock else "Out of Stock",
        "dosage": str(row["Dosage_Instruction"]).strip(),
    }


class MedicineRepository:
    def __init__(self, csv_path: Optional[Path] = None) -> None:
        self.csv_path = Path(csv_path or settings.data_path)
        self._records: list[dict] = []
        self._lock = threading.RLock()

    def load(self) -> list[dict]:
        """(Re)load the CSV file into memory."""
        if not self.csv_path.exists():
            raise FileNotFoundError(f"Medicine dataset not found: {self.csv_path}")
        df = pd.read_csv(self.csv_path, dtype=str).fillna("")
        missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"medicines.csv is missing columns: {missing}")
        records = [_to_record(row) for _, row in df.iterrows()]
        with self._lock:
            self._records = records
        logger.info("Loaded %d medicines from %s", len(records), self.csv_path.name)
        return self.all()

    def all(self) -> list[dict]:
        with self._lock:
            return copy.deepcopy(self._records)

    def get_by_id(self, medicine_id: int) -> Optional[dict]:
        for rec in self.all():
            if rec["id"] == medicine_id:
                return rec
        return None

    def find_in_text(self, text: str) -> tuple[Optional[dict], Optional[str]]:
        """Find a medicine mentioned in free text.

        Returns (record, matched_via) where matched_via is
        'name', 'brand' (an alternative/brand name) or 'fuzzy' (typo tolerant).
        """
        lowered = text.lower()
        records = self.all()

        keys: list[tuple[str, dict, str]] = []
        for rec in records:
            name = rec["name"].lower()
            keys.append((name, rec, "name"))
            first = name.split()[0]
            if first != name and len(first) >= 3:
                keys.append((first, rec, "name"))
            for alt in rec["alternatives"]:
                keys.append((alt.lower(), rec, "brand"))

        # Exact names first (longest first), then brand names
        keys.sort(key=lambda k: (k[2] != "name", -len(k[0])))
        for key, rec, via in keys:
            if re.search(rf"\b{re.escape(key)}\b", lowered):
                return rec, via

        # Typo tolerance, e.g. "paracetmol"
        first_words = {r["name"].lower().split()[0]: r for r in records}
        for token in re.findall(r"[a-z]{4,}", lowered):
            match = get_close_matches(token, list(first_words), n=1, cutoff=0.82)
            if match:
                return first_words[match[0]], "fuzzy"
        return None, None


repository = MedicineRepository()