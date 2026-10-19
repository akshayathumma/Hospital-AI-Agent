import { FaCircleNotch } from "react-icons/fa";

export default function Spinner({ className = "h-5 w-5", label }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <FaCircleNotch className={`animate-spin text-brand-500 ${className}`} />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </span>
  );
}