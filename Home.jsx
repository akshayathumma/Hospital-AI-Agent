import { FaBoxes, FaBrain, FaCapsules, FaDatabase, FaExchangeAlt, FaMicrophone, FaNotesMedical, FaPython, FaReact, FaRobot, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import WorkflowDiagram from "../components/WorkflowDiagram";

const FEATURES = [
  { icon: FaSearch, title: "Semantic Medicine Search", text: "Find medicines by name, symptom or use case — meaning-based, not keyword-based." },
  { icon: FaBoxes, title: "Live Stock Check", text: "Instantly see whether a medicine is available or out of stock." },
  { icon: FaExchangeAlt, title: "Smart Alternatives", text: "Out of stock? Get suitable alternatives right away." },
  { icon: FaNotesMedical, title: "Dosage Guidance", text: "Clear dosage instructions straight from the pharmacy database." },
  { icon: FaRobot, title: "AI Agent", text: "A LangChain agent chooses the right tool for every question." },
  { icon: FaMicrophone, title: "Voice Enabled", text: "Speak your question and listen to the answer." },
];

const TECH = [
  { icon: FaReact, name: "React + Vite", text: "Fast, responsive UI with Tailwind CSS" },
  { icon: FaPython, name: "FastAPI", text: "Modular, validated REST backend" },
  { icon: FaDatabase, name: "ChromaDB", text: "Persistent vector database" },
  { icon: FaBrain, name: "MiniLM Embeddings", text: "all-MiniLM-L6-v2 sentence vectors" },
  { icon: FaRobot, name: "LangChain", text: "Tools, prompts and agent routing" },
  { icon: FaCapsules, name: "Mistral 7B", text: "Local LLM served by Ollama" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-sky-400 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-in">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">RAG · Local LLM · Private</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Your AI Pharmacist for Smarter Medicine Guidance
            </h1>
            <p className="mt-4 max-w-xl text-lg text-blue-50">
              Search medicines, check stock, find alternatives and understand dosage instructions — answered
              instantly by an AI grounded in your hospital's own inventory.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/chat" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                Start Chatting
              </Link>
              <Link to="/search" className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Search Medicines
              </Link>
            </div>
          </div>

          <div className="hidden animate-float lg:block">
            <div className="mx-auto max-w-sm space-y-3 rounded-2xl bg-white/15 p-5 backdrop-blur">
              <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-white px-4 py-2 text-sm text-slate-700">Medicine for fever</div>
              <div className="w-fit rounded-2xl rounded-bl-sm bg-brand-800/70 px-4 py-2 text-sm">
                <p className="font-semibold">💊 Paracetamol 500mg</p>
                <p>✅ Available · 1 tablet every 6 hrs</p>
                <p>Alternatives: Crocin, Dolo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-center text-2xl font-bold">What it can do</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-xl text-brand-600 dark:bg-brand-900/50 dark:text-brand-200">
                <Icon />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section>
        <h2 className="text-center text-2xl font-bold">Built with modern technology</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map(({ icon: Icon, name, text }) => (
            <div key={name} className="card flex items-center gap-4 p-5 hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-sky-400 text-xl text-white">
                <Icon />
              </span>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section>
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-6">
          <WorkflowDiagram />
        </div>
      </section>
    </div>
  );
}