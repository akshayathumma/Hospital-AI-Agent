export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">About MediAssist</h1>

      <div className="card space-y-3 p-6">
        <h2 className="text-xl font-semibold">The project</h2>
        <p className="text-slate-600 dark:text-slate-300">
          MediAssist is an AI agent for hospital pharmacies and medical shops. It uses Retrieval-Augmented
          Generation (RAG) so every answer is grounded in the pharmacy's own medicine database instead of the
          model's memory — which keeps hallucinations out of medical guidance.
        </p>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-xl font-semibold">How a question is answered</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-slate-600 dark:text-slate-300">
          <li>The React app sends your question to the FastAPI backend.</li>
          <li>A LangChain agent picks a tool: search, stock, alternatives, dosage or FAQ.</li>
          <li>The query is embedded with all-MiniLM-L6-v2 and matched semantically in ChromaDB.</li>
          <li>The retrieved medicine records are passed as context to Mistral running locally via Ollama.</li>
          <li>The answer is generated with strength, stock, dosage, alternatives and a medical disclaimer.</li>
        </ol>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p className="text-slate-600 dark:text-slate-300">
          The language model runs on your own machine through Ollama. Questions and medicine data never leave
          your infrastructure.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
        ⚠️ <strong>Medical disclaimer:</strong> MediAssist provides general information only. It does not diagnose
        conditions or prescribe medicines. Always consult a qualified doctor or pharmacist before taking any
        medicine.
      </div>
    </div>
  );
}