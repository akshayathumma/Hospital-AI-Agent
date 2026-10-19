import { FaCheckCircle, FaPills, FaTimesCircle } from "react-icons/fa";

function Row({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-slate-700 dark:text-slate-200">{children}</dd>
    </div>
  );
}

export default function MedicineCard({ medicine: m }) {
  return (
    <div className="card animate-fade-in p-5 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-xl text-brand-600 dark:bg-brand-900/50 dark:text-brand-200">
            <FaPills />
          </span>
          <div>
            <h3 className="text-lg font-semibold leading-tight">{m.name}</h3>
            <p className="text-sm text-slate-500">{m.strength}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            m.in_stock
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          }`}
        >
          {m.in_stock ? <FaCheckCircle /> : <FaTimesCircle />} {m.stock_status}
        </span>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Use case">
          <div className="flex flex-wrap gap-1.5">
            {m.use_case.map((u) => (
              <span key={u} className="chip">
                {u}
              </span>
            ))}
          </div>
        </Row>
        <Row label="Dosage">{m.dosage}</Row>
        <Row label="Alternative">
          <div className="flex flex-wrap gap-1.5">
            {m.alternatives.length ? (
              m.alternatives.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-slate-400">None</span>
            )}
          </div>
        </Row>
      </dl>

      {typeof m.score === "number" && (
        <p className="mt-4 text-right text-[11px] text-slate-400">Relevance {Math.round(m.score * 100)}%</p>
      )}
    </div>
  );
}