import { useState } from "react";
import toast from "react-hot-toast";
import { FaBoxes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import MedicineCard from "../components/MedicineCard";
import Spinner from "../components/Spinner";
import { CardSkeleton } from "../components/Skeleton";
import { checkStock } from "../services/api";

const SUGGESTIONS = ["Paracetamol", "Amoxicillin", "Insulin", "Ibuprofen", "Metformin"];

export default function StockSearch({ history }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (term) => {
    const value = term.trim();
    if (!value) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await checkStock(value);
      setResult(data);
      history.add(value);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Search</h1>
        <p className="text-slate-500">Check whether a medicine is available right now.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
        className="flex gap-2"
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a medicine name, e.g. Amoxicillin"
          maxLength={300}
        />
        <button className="btn-primary shrink-0" disabled={!input.trim() || loading}>
          {loading ? <Spinner className="h-4 w-4 !text-white" /> : <FaBoxes />}
          <span className="hidden sm:inline">Check</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              run(s);
            }}
            className="chip cursor-pointer transition hover:bg-brand-100"
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <CardSkeleton />}

      {result && !loading && (
        <div className="animate-fade-in space-y-4">
          <div
            className={`flex items-center gap-4 rounded-2xl p-5 ${
              !result.found
                ? "bg-slate-100 dark:bg-slate-800"
                : result.in_stock
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            <span className="text-4xl">
              {!result.found ? "❓" : result.in_stock ? <FaCheckCircle /> : <FaTimesCircle />}
            </span>
            <div>
              <p className="text-xl font-bold">{result.status}</p>
              <p className="text-sm">{result.message}</p>
            </div>
          </div>

          {result.found && result.medicine && <MedicineCard medicine={result.medicine} />}

          {result.found && !result.in_stock && result.alternatives.length > 0 && (
            <div className="card p-5">
              <p className="font-semibold">Suggested alternatives</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.alternatives.map((a) => (
                  <span key={a} className="chip !px-3 !py-1 !text-sm">
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">Ask the pharmacist or your doctor before switching medicines.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}