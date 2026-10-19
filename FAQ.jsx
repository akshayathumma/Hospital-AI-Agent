import { useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaChevronDown } from "react-icons/fa";
import MedicineCard from "../components/MedicineCard";
import Spinner from "../components/Spinner";
import { askFaq } from "../services/api";

const FAQS = [
  "Medicine for fever?",
  "Medicine for allergy?",
  "Medicine for diabetes?",
  "Medicine for pain?",
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);

  const toggle = async (i) => {
    if (openIndex === i) {
      setOpenIndex(null);
      return;
    }
    setOpenIndex(i);
    if (answers[i]) return;
    setLoadingIndex(i);
    try {
      const data = await askFaq(FAQS[i]);
      setAnswers((prev) => ({ ...prev, [i]: data }));
    } catch (err) {
      toast.error(err.message);
      setOpenIndex(null);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-slate-500">Tap a question to get an answer from the AI.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((q, i) => (
          <div key={q} className="card overflow-hidden">
            <button onClick={() => toggle(i)} className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50">
              {q}
              <FaChevronDown className={`text-slate-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
            </button>

            {openIndex === i && (
              <div className="animate-fade-in space-y-4 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
                {loadingIndex === i && <Spinner label="Asking the AI…" />}
                {answers[i] && (
                  <>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{answers[i].answer}</ReactMarkdown>
                    </div>
                    {answers[i].medicines.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {answers[i].medicines.map((m) => (
                          <MedicineCard key={m.id} medicine={m} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}