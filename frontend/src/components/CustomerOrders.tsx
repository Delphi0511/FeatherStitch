import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cancelOrder, listMyOrders, ACTIVE_STATUSES, CLOSED_STATUSES, formatDate } from "../api/orders.tsx";
import type { Order } from "../api/orders.tsx";
import { formatPrice, thumbUrl } from "../api/posts.tsx";
import { MeasurementList, OrderProgress, PageShell, StatusBadge } from "./OrderBits";

type Filter = "all" | "active" | "delivered" | "closed";

const FILTERS: { key: Filter; label: string; match: (o: Order) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "Active", match: (o) => ACTIVE_STATUSES.includes(o.status) },
  { key: "delivered", label: "Delivered", match: (o) => o.status === "Delivered" },
  { key: "closed", label: "Cancelled / Declined", match: (o) => CLOSED_STATUSES.includes(o.status) },
];

// The customer's orders with live status, progress, shared measurements and cancel (while pending).
const CustomerOrders = () => {
  const navigate = useNavigate();
  const placedTitle = (useLocation().state as { placed?: string } | null)?.placed;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    listMyOrders()
      .then(setOrders)
      .catch((err: Error) => setError(err.message || "Could not load your orders."))
      .finally(() => setLoading(false));
  }, []);

  // Two clicks: the first asks for confirmation, the second cancels on the server.
  const handleCancel = async (id: string) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    setBusyId(id);
    setError("");
    try {
      const updated = await cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel the order.");
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  };

  const active = FILTERS.find((f) => f.key === filter)!;
  const visible = orders.filter(active.match);

  return (
    <PageShell backTo="/customerdashboard" backLabel="Dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Orders</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Track every order you've placed with a tailor.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/findtailor")}
          className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-200 hover:border-violet-500 hover:text-violet-300 text-sm font-semibold transition-colors"
        >
          + Order a new design
        </button>
      </div>

      {placedTitle && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-emerald-900/30 border border-emerald-500/30 text-emerald-300">
          ✓ Order placed for <strong>{placedTitle}</strong>. The tailor will review it soon.
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">⚠️ {error}</div>
      )}

      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === f.key ? "bg-emerald-500/15 border-emerald-500 text-emerald-300" : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {f.label} <span className="opacity-60">{orders.filter(f.match).length}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading your orders…</p>
      ) : orders.length === 0 ? (
        !error && (
          <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
            <div className="text-4xl mb-3">📦</div>
            <h2 className="text-white font-bold text-lg mb-1">No orders yet</h2>
            <p className="text-slate-400 text-sm mb-6">Find a tailor, open one of their designs and choose "Order this design".</p>
            <button
              type="button"
              onClick={() => navigate("/findtailor")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold"
            >
              Find a tailor →
            </button>
          </div>
        )
      ) : visible.length === 0 ? (
        <p className="text-slate-400 text-sm">No orders in this list.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((order) => (
            <article key={order._id} className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
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
                        by{" "}
                        <button type="button" onClick={() => navigate(`/tailors/${order.tailor}`)} className="text-violet-300 hover:text-violet-200">
                          {order.tailorName || "tailor"}
                        </button>
                        {" · "}Placed {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  {order.design.price !== undefined && (
                    <p className="text-emerald-300 font-extrabold mt-1">{formatPrice(order.design.price)}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <OrderProgress status={order.status} />
              </div>

              {order.notes && <p className="mt-4 text-sm text-slate-300"><span className="text-slate-500">Your notes:</span> {order.notes}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded((id) => (id === order._id ? null : order._id))}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {expanded === order._id ? "Hide" : "Show"} shared measurements ({order.measurements.length})
                </button>
                {order.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(order._id)}
                    onBlur={() => setConfirmingId((id) => (id === order._id ? null : id))}
                    disabled={busyId === order._id}
                    className={`ml-auto px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-60 ${
                      confirmingId === order._id ? "border-red-500 bg-red-500/15 text-red-300" : "border-red-500/40 text-red-400 hover:border-red-500"
                    }`}
                  >
                    {busyId === order._id ? "Cancelling…" : confirmingId === order._id ? "Confirm cancel" : "Cancel order"}
                  </button>
                )}
              </div>

              {expanded === order._id && (
                <div className="mt-3">
                  <MeasurementList measurements={order.measurements} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default CustomerOrders;
