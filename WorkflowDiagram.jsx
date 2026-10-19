import { Fragment } from "react";
import { FaArrowDown, FaArrowRight, FaBrain, FaCommentMedical, FaDatabase, FaProjectDiagram, FaReact, FaRobot, FaServer } from "react-icons/fa";

const STEPS = [
  { icon: FaReact, title: "React Frontend", sub: "User asks a question" },
  { icon: FaServer, title: "FastAPI Backend", sub: "Validates & routes" },
  { icon: FaProjectDiagram, title: "Embedding Model", sub: "all-MiniLM-L6-v2" },
  { icon: FaDatabase, title: "ChromaDB", sub: "Semantic retrieval" },
  { icon: FaRobot, title: "LangChain Agent", sub: "Picks the right tool" },
  { icon: FaBrain, title: "Mistral (Ollama)", sub: "Local LLM" },
  { icon: FaCommentMedical, title: "Response", sub: "Grounded answer" },
];

export default function WorkflowDiagram() {
  return (
    <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-stretch lg:justify-between">
      {STEPS.map(({ icon: Icon, title, sub }, i) => (
        <Fragment key={title}>
          <div className="card w-full max-w-xs p-4 text-center hover:-translate-y-1 hover:shadow-lg lg:w-auto lg:flex-1">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-xl text-white">
              <Icon />
            </span>
            <p className="mt-3 text-sm font-semibold">{title}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
          {i < STEPS.length - 1 && (
            <span className="self-center text-brand-400">
              <FaArrowDown className="lg:hidden" />
              <FaArrowRight className="hidden lg:block" />
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}