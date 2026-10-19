import { FaHistory, FaTrash } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { NAV_ITEMS } from "./navItems";

export default function Sidebar({ open, onClose, history }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:z-10 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white shadow"
                    : "text-slate-600 hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <FaHistory /> Recent searches
            </p>
            {history.items.length > 0 && (
              <button
                onClick={() => {
                  history.clear();
                  toast.success("Search history cleared");
                }}
                className="text-slate-400 hover:text-red-500"
                title="Clear history"
              >
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>
          {history.items.length === 0 ? (
            <p className="px-1 text-xs text-slate-400">Your searches will appear here.</p>
          ) : (
            <ul className="space-y-1">
              {history.items.map((item) => (
                <li key={item}>
                  <Link
                    to={`/search?q=${encodeURIComponent(item)}`}
                    onClick={onClose}
                    className="block truncate rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}