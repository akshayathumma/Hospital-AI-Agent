import { FaRobot } from "react-icons/fa";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white">
        <FaRobot />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-brand-500"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}