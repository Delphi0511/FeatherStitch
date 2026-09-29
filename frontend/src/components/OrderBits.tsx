import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { MEASUREMENT_LABELS, ORDER_STEPS, sectionLabel } from "../api/orders.tsx";
import type { OrderMeasurement, OrderStatus } from "../api/orders.tsx";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  Accepted: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "In progress": "bg-violet-500/15 text-violet-300 border-violet-500/40",
  Ready: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
  Delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Declined: "bg-red-500/15 text-red-300 border-red-500/40",
  Cancelled: "bg-slate-600/30 text-slate-300 border-slate-500/40",
};

// Colored pill showing an order's status.
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// Step tracker Pending -> Delivered; a declined/cancelled order shows where it stopped.
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "Declined" || status === "Cancelled") {
    return (
      <p className="text-xs text-slate-400">
        {status === "Declined" ? "The tailor declined this order." : "This order was cancelled."}
      </p>
    );
  }
  const current = ORDER_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Progress: ${status}`}>
      {ORDER_STEPS.map((step, i) => (
        <div key={step} className="flex-1 min-w-0">
          <div className={`h-1.5 rounded-full ${i <= current ? "bg-gradient-to-r from-cyan-500 to-emerald-400" : "bg-slate-700"}`} />
          <p className={`mt-1 text-[10px] truncate ${i <= current ? "text-slate-200" : "text-slate-500"}`}>{step}</p>
        </div>
      ))}
    </div>
  );
}

// Lists measurement sections as "Label: value unit" rows.
export function MeasurementList({ measurements }: { measurements: OrderMeasurement[] }) {
  if (measurements.length === 0) {
    return <p className="text-xs text-slate-500">No measurements attached.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {measurements.map((m) => (
        <div key={`${m.gender}-${m.type}`} className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-2">{sectionLabel(m)}</p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {Object.entries(m.values).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-slate-400 truncate">{MEASUREMENT_LABELS[key] || key}</dt>
                <dd className="text-slate-100 font-semibold text-right">
                  {value} {m.units?.[key] || (typeof value === "number" ? "cm" : "")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

// Page frame shared by the order pages: top bar with a back link and the logo.
export function PageShell({ backTo, backLabel, children }: { backTo: string; backLabel: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 50%, #0f2040 100%)" }}>
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800">
        <button type="button" onClick={() => navigate(backTo)} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← {backLabel}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FeatherStitch</span>
        </div>
      </nav>
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-10">{children}</div>
    </div>
  );
}
