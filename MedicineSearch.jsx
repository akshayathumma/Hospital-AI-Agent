import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import { CardSkeletonGrid } from "../components/Skeleton";
import { searchMedicines } from "../services/api";

const SUGGESTIONS = ["Paracetamol", "fever", "diabetes", "acidity", "allergy", "pain"];

export default function MedicineSearch({ history }) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(q);
    if (!q) {
      setResults(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchMedicines(q);
        if (!cancelled) {
          setResults(data.results);
          history.add(q);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message);
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const value = input.trim();
    if (value) setParams({ q: value });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medicine Search</h1>
        <p className="text-slate-500">Search by medicine name, symptom or use case — powered by semantic search.</p>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Paracetamol, fever, diabetes…"
          maxLength={300}
        />
        <button className="btn-primary shrink-0" disabled={!input.trim() || loading}>
          <FaSearch /> <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => setParams({ q: s })} className="chip cursor-pointer transition hover:bg-brand-100">
            {s}
          </button>
        ))}
      </div>

      {loading && <CardSkeletonGrid count={3} />}

      {!loading && results && results.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          No medicines matched “{q}”. Try a different name or symptom.
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((m) => (
            <MedicineCard key={m.id} medicine={m} />
          ))}
        </div>
      )}
    </div>
  );
}