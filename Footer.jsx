import { FaHeartbeat } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      <p className="flex items-center justify-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
        <FaHeartbeat className="text-red-500" /> MediAssist · AI Agent for Hospital & Medical Shop Prescription Guidance
      </p>
      <p className="mt-1">
        ⚠️ For general guidance only. Not a substitute for professional medical advice — always consult a
        doctor or pharmacist.
      </p>
    </footer>
  );
}