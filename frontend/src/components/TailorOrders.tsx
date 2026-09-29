import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listIncomingOrders, updateOrderStatus, CLOSED_STATUSES, TAILOR_NEXT_STEP, formatDate } from "../api/orders.tsx";
import type { Order, OrderStatus } from "../api/orders.tsx";
import { ApiError, formatPrice, thumbUrl } from "../api/posts.tsx";
import { MeasurementList, OrderProgress, PageShell, StatusBadge } from "./OrderBits";

type Tab = "all" | "new" | "working" | "delivered" | "closed";

const TABS: { key: Tab; label: string; match: (o: Order) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "new", label: "New requests", match: (o) => o.status === "Pending" },
  { key: "working", label: "In work", match: (o) => ["Accepted", "In progress", "Ready"].includes(o.status) },
  { key: "delivered", label: "Delivered", match: (o) => o.status === "Delivered" },
  { key: "closed", label: "Declined / Cancelled", match: (o) => CLOSED_STATUSES.includes(o.status) },
];

// The tailor's incoming orders: review the customer's details and measurements, then move each order along.
const TailorOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmingDecline, setConfirmingDecline] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    listIncomingOrders()
      .then(setOrders)
      .catch((err: Error) => {
        if (err instanceof ApiError && err.status === 404) setNeedsProfile(true);
        else setError(err.message || "Could not load your orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Sends the status change and swaps in the server's updated order.
  const changeStatus = async (id: string, status: OrderStatus) => {
    setBusyId(id);
    setError("");
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the order.");
    } finally {
      setBusyId(null);
      setConfirmingDecline(null);
    }
  };

  // Declining is final, so it takes two clicks.
  const handleDecline = (id: string) => {
    if (confirmingDecline !== id) setConfirmingDecline(id);
    else void changeStatus(id, "Declined");
  };

  const current = TABS.find((t) => t.key === tab)!;
  const visible = orders.filter(current.match);

  return (
    <PageShell backTo="/tailordashboard" backLabel="Dashboard">
      <div className="mb-8">
        <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-2">Orders</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders</h1>
        <p className="text-slate-400 text-sm mt-1">Accept new requests and keep customers updated as you work.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">⚠️ {error}</div>
      )}

      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const count = orders.filter(t.match).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  tab === t.key ? "bg-pink-500/15 border-pink-500 text-pink-300" : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {t.label}{" "}
                <span className={t.key === "new" && count > 0 ? "text-amber-300 font-bold" : "opacity-60"}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading orders…</p>
      ) : needsProfile ? (
        <div className="text-center border border-dashed border-cyan-700/60 rounded-2xl py-16 px-6">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-white font-bold text-lg mb-1">Complete your profile first</h2>
          <p className="text-slate-400 text-sm mb-6">Customers order from your profile, so save it before you can receive orders.</p>
          <button type="button" onClick={() => navigate("/tailorprofile")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-sm font-bold">
            Go to my profile →
          </button>
        </div>
      ) : orders.length === 0 ? (
        !error && (
          <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
            <div className="text-4xl mb-3">📦</div>
            <h2 className="text-white font-bold text-lg mb-1">No orders yet</h2>
            <p className="text-slate-400 text-sm mb-6">Customers order from your published designs. Keep your portfolio fresh.</p>
            <button type="button" onClick={() => navigate("/posts")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-bold">
              Manage my posts →
            </button>
          </div>
        )
      ) : visible.length === 0 ? (
        <p className="text-slate-400 text-sm">No orders in this list.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((order) => {
            const next = TAILOR_NEXT_STEP[order.status];
            const busy = busyId === order._id;
            const location = [order.customer.city, order.customer.state].filter(Boolean).join(", ");
            return (
              <article
                key={order._id}
                className={`rounded-2xl border bg-slate-800/40 p-5 ${order.status === "Pending" ? "border-amber-500/40" : "border-slate-700/60"}`}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900">
                    {order.design.image ? (
                      <img src={thumbUrl(order.design.image, 200)} alt={order.design.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🧵</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-base leading-snug">{order.design.title}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {order.design.price !== undefined && <span className="text-emerald-300 font-bold">{formatPrice(order.design.price)}</span>}
                          {order.design.turnaround && ` · ⏱ ${order.design.turnaround}`}
                          {` · Ordered ${formatDate(order.createdAt)}`}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Customer */}
                    <div className="mt-3 text-sm">
                      <p className="text-slate-100 font-semibold">👤 {order.customer.name}</p>
                      <p className="text-slate-400 text-xs">
                        {[order.customer.address, location].filter(Boolean).join(" · ")}
                        {" · "}
                        <a href={`mailto:${order.customer.email}`} className="text-cyan-300 hover:text-cyan-200">{order.customer.email}</a>
                      </p>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <p className="mt-4 text-sm text-slate-200 rounded-xl bg-slate-900/60 border border-slate-700/60 px-4 py-3">
                    <span className="text-slate-500">Customer notes:</span> {order.notes}
                  </p>
                )}

                <div className="mt-4">
                  <OrderProgress status={order.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpanded((id) => (id === order._id ? null : order._id))}
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    {expanded === order._id ? "Hide" : "Show"} measurements ({order.measurements.length})
                  </button>

                  <div className="ml-auto flex gap-2">
                    {order.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDecline(order._id)}
                          onBlur={() => setConfirmingDecline((id) => (id === order._id ? null : id))}
                          disabled={busy}
                          className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-60 ${
                            confirmingDecline === order._id ? "border-red-500 bg-red-500/15 text-red-300" : "border-red-500/40 text-red-400 hover:border-red-500"
                          }`}
                        >
                          {confirmingDecline === order._id ? "Confirm decline" : "Decline"}
                        </button>
                        <button
                          type="button"
                          onClick={() => changeStatus(order._id, "Accepted")}
                          disabled={busy}
                          className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-60 text-white text-xs font-bold"
                        >
                          {busy ? "Saving…" : "Accept order"}
                        </button>
                      </>
                    )}
                    {next && (
                      <button
                        type="button"
                        onClick={() => changeStatus(order._id, next[0])}
                        disabled={busy}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-60 text-white text-xs font-bold"
                      >
                        {busy ? "Saving…" : `${next[1]} →`}
                      </button>
                    )}
                  </div>
                </div>

                {expanded === order._id && (
                  <div className="mt-3">
                    <MeasurementList measurements={order.measurements} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default TailorOrders;
