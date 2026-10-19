import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Navbar({ dark, onToggleDark, onMenu }) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MediAssist logo" className="h-9 w-9" />
            <div className="leading-tight">
              <p className="text-lg font-bold text-brand-700 dark:text-brand-300">MediAssist</p>
              <p className="hidden text-[11px] text-slate-500 sm:block">Hospital & Medical Shop AI</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/chat" className="btn-primary hidden !py-2 sm:inline-flex">
            Ask the AI
          </Link>
          <button
            onClick={onToggleDark}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-yellow-300 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </header>
  );
}