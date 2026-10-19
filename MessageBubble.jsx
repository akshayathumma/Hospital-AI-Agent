import toast from "react-hot-toast";
import { FaCopy, FaRobot, FaStop, FaUser, FaVolumeUp } from "react-icons/fa";
import MedicineCard from "./MedicineCard";
import StreamedMarkdown from "./StreamedMarkdown";

export default function MessageBubble({ message, speech, onTick }) {
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const time = new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <div className="flex animate-fade-in items-end justify-end gap-3">
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand-600 px-4 py-3 text-white shadow-sm">
            {message.content}
          </div>
          <p className="mt-1 text-right text-[11px] text-slate-400">{time}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100">
          <FaUser />
        </span>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
        <FaRobot />
      </span>
      <div className="min-w-0 max-w-[92%] sm:max-w-[80%]">
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ${
            message.error
              ? "border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
              : "bg-white dark:bg-slate-800"
          }`}
        >
          <StreamedMarkdown text={message.content} animate={message.animate} onTick={onTick} />
        </div>

        {message.medicines?.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {message.medicines.map((m) => (
              <MedicineCard key={m.id} medicine={m} />
            ))}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-1 text-slate-400">
          <span className="mr-2 text-[11px]">
            {time}
            {message.toolUsed && message.toolUsed !== "none" ? ` · tool: ${message.toolUsed}` : ""}
            {message.llmUsed === false && !message.error ? " · offline mode" : ""}
          </span>
          <button onClick={copy} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700" title="Copy">
            <FaCopy className="text-xs" />
          </button>
          {speech.ttsSupported && (
            <button
              onClick={() => speech.speak(message.id, message.content)}
              className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
              title={speech.speakingId === message.id ? "Stop" : "Read aloud"}
            >
              {speech.speakingId === message.id ? <FaStop className="text-xs" /> : <FaVolumeUp className="text-xs" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}