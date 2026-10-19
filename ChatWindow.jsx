import { useCallback, useEffect, useRef } from "react";
import { FaStethoscope } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export const SAMPLE_QUERIES = [
  "Do you have Paracetamol 500mg?",
  "Medicine for fever",
  "Medicine for diabetes",
  "Alternative for Ibuprofen",
  "Stock of Amoxicillin",
  "How should I take Cetirizine?",
  "Medicine for acidity",
  "Is Insulin available?",
];

export default function ChatWindow({ messages, loading, speech, onSuggestion }) {
  const containerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Auto-scroll whenever messages change or the typing indicator toggles
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  return (
    <div ref={containerRef} className="flex-1 space-y-5 overflow-y-auto px-3 py-5 sm:px-6">
      {messages.length === 0 && !loading ? (
        <div className="mx-auto flex h-full max-w-2xl animate-fade-in flex-col items-center justify-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-3xl text-brand-600 dark:bg-brand-900/50 dark:text-brand-200">
            <FaStethoscope />
          </span>
          <h2 className="mt-4 text-2xl font-bold">How can I help you today?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask about medicines, stock, alternatives or dosage instructions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => onSuggestion(q)}
                className="rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow dark:border-slate-600 dark:bg-slate-800 dark:text-brand-200 dark:hover:bg-slate-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((m) => <MessageBubble key={m.id} message={m} speech={speech} onTick={scrollToBottom} />)
      )}
      {loading && <TypingIndicator />}
    </div>
  );
}