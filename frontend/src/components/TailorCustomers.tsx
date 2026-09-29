import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listIncomingOrders, ACTIVE_STATUSES, formatDate } from "../api/orders.tsx";
import type { Order } from "../api/orders.tsx";
import { ApiError } from "../api/posts.tsx";
import { PageShell, StatusBadge } from "./OrderBits";

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  location: string;
  orders: Order[];
  active: number;
  delivered: number;
  lastOrderAt: string;
}

// Groups orders by customer; orders arrive newest first, so the first one per customer is the latest.
function summarize(orders: Order[]): CustomerSummary[] {
  const byCustomer = new Map<string, CustomerSummary>();
  for (const order of orders) {
    let summary = byCustomer.get(order.customerUserId);
    if (!summary) {
      summary = {
        id: order.customerUserId,
        name: order.customer.name,
        email: order.customer.email,
        location: [order.customer.city, order.customer.state].filter(Boolean).join(", "),
        orders: [],
        active: 0,
        delivered: 0,
        lastOrderAt: order.createdAt,
      };
      byCustomer.set(order.customerUserId, summary);
    }
    summary.orders.push(order);
    if (ACTIVE_STATUSES.includes(order.status)) summary.active++;
    if (order.status === "Delivered") summary.delivered++;
  }
  return [...byCustomer.values()];
}

// Everyone who has ordered from this tailor, with their order history.
const TailorCustomers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listIncomingOrders()
      .then((orders) => setCustomers(summarize(orders)))
      .catch((err: Error) => {
        if (err instanceof ApiError && err.status === 404) setNeedsProfile(true);
        else setError(err.message || "Could not load your customers.");
      })
      .finally(() => setLoading(false));
  }, []);

  const term = search.trim().toLowerCase();
  const visible = term
    ? customers.filter((c) => [c.name, c.email, c.location].some((v) => v.toLowerCase().includes(term)))
    : customers;

  return (
    <PageShell backTo="/tailordashboard" backLabel="Dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Customers</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">
            {customers.length > 0
              ? `${customers.length} ${customers.length === 1 ? "customer has" : "customers have"} ordered from you.`
              : "Everyone who orders from you appears here."}
          </p>
        </div>
        {customers.length > 0 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or city"
            className="w-full sm:w-64 bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">⚠️ {error}</div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading customers…</p>
      ) : needsProfile ? (
        <div className="text-center border border-dashed border-cyan-700/60 rounded-2xl py-16 px-6">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-white font-bold text-lg mb-1">Complete your profile first</h2>
          <p className="text-slate-400 text-sm mb-6">Customers order from your profile, so save it before you can receive orders.</p>
          <button type="button" onClick={() => navigate("/tailorprofile")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-sm font-bold">
            Go to my profile →
          </button>
        </div>
      ) : customers.length === 0 ? (
        !error && (
          <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
            <div className="text-4xl mb-3">👥</div>
            <h2 className="text-white font-bold text-lg mb-1">No customers yet</h2>
            <p className="text-slate-400 text-sm">When someone orders one of your designs, they'll be listed here.</p>
          </div>
        )
      ) : visible.length === 0 ? (
        <p className="text-slate-400 text-sm">No customers match "{search}".</p>
      ) : (
        <div className="space-y-3">
          {visible.map((c) => (
            <article key={c.id} className="rounded-2xl border border-slate-700/60 bg-slate-800/40">
              <button
                type="button"
                onClick={() => setExpanded((id) => (id === c.id ? null : c.id))}
                className="w-full flex flex-wrap items-center gap-4 p-5 text-left"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold">
                  {(c.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{c.name}</p>
                  <p className="text-slate-400 text-xs truncate">{[c.email, c.location].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex gap-5 text-center text-xs">
                  <div><p className="text-white font-extrabold text-base">{c.orders.length}</p><p className="text-slate-500">orders</p></div>
                  <div><p className="text-amber-300 font-extrabold text-base">{c.active}</p><p className="text-slate-500">active</p></div>
                  <div><p className="text-emerald-300 font-extrabold text-base">{c.delivered}</p><p className="text-slate-500">delivered</p></div>
                </div>
                <p className="text-slate-500 text-xs w-full sm:w-auto">Last order {formatDate(c.lastOrderAt)} {expanded === c.id ? "▲" : "▼"}</p>
              </button>

              {expanded === c.id && (
                <div className="border-t border-slate-700/60 px-5 py-4 space-y-2">
                  {c.orders.map((o) => (
                    <div key={o._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-slate-200">{o.design.title}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs">{formatDate(o.createdAt)}</span>
                        <StatusBadge status={o.status} />
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate("/tailororders")}
                    className="mt-2 text-xs font-semibold text-pink-300 hover:text-pink-200"
                  >
                    Manage these orders →
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default TailorCustomers;
