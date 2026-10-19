"""Convenience CLI: `python ingest.py` rebuilds the vector database."""
from app.services.ingest import ingest_data

if __name__ == "__main__":
    total = ingest_data(reset=True)
    print(f"Done. {total} medicines indexed into ChromaDB.")