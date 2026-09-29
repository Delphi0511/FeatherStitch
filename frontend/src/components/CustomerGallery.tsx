import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyOrders, CLOSED_STATUSES } from "../api/orders.tsx";
import type { Order } from "../api/orders.tsx";
import { formatPrice, thumbUrl } from "../api/posts.tsx";
import type { PostData } from "./AddEditPost";
import PostDetailModal from "./PostDetailModal";
import { PageShell, StatusBadge } from "./OrderBits";

// Turns an order's design snapshot into the shape the shared detail view expects.
const designAsPost = (order: Order): PostData => ({
  id: order._id,
  title: order.design.title,
  category: order.design.category || "",
  turnaround: order.design.turnaround || "",
  description: "",
  price: order.design.price ?? 0,
  tags: "",
  images: order.design.image ? [{ id: order.design.image, url: order.design.image }] : [],
});

// The customer's collection: every design they have ordered (cancelled/declined orders excluded).
const CustomerGallery = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Order | null>(null);
  const closeDetail = useCallback(() => setOpen(null), []);

  useEffect(() => {
    listMyOrders()
      .then((all) => setOrders(all.filter((o) => !CLOSED_STATUSES.includes(o.status))))
      .catch((err: Error) => setError(err.message || "Could not load your gallery."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell backTo="/customerdashboard" backLabel="Dashboard">
      <div className="mb-8">
        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">My Collection</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Gallery</h1>
        <p className="text-slate-400 text-sm mt-1">
          {orders.length > 0
            ? `${orders.length} ${orders.length === 1 ? "design" : "designs"} you have ordered from tailors.`
            : "All the designs you have ordered from tailors."}
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">⚠️ {error}</div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading your gallery…</p>
      ) : orders.length === 0 ? (
        !error && (
          <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
            <div className="text-4xl mb-3">🖼️</div>
            <h2 className="text-white font-bold text-lg mb-1">No ordered designs yet</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              When you order a design from a tailor, it will appear here. Start by browsing tailors and their work.
            </p>
            <button
              type="button"
              onClick={() => navigate("/findtailor")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-900/30 transition-all"
            >
              Find a tailor →
            </button>
          </div>
        )
      ) : (
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <button
              key={order._id}
              type="button"
              onClick={() => setOpen(order)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 text-left"
            >
              {order.design.image ? (
                <img
                  src={thumbUrl(order.design.image)}
                  alt={order.design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🧵</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3">
                <StatusBadge status={order.status} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-1">{order.tailorName}</p>
                <h3 className="text-white font-bold text-base leading-snug">{order.design.title}</h3>
                {order.design.price !== undefined && (
                  <p className="text-slate-200 text-sm font-semibold mt-1">{formatPrice(order.design.price)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && (
        <PostDetailModal
          post={designAsPost(open)}
          onClose={closeDetail}
          footer={
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                Status: <StatusBadge status={open.status} />
              </div>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="w-full py-2.5 rounded-xl border border-slate-600 text-slate-200 text-sm font-semibold hover:border-amber-500 hover:text-amber-300 transition-colors"
              >
                View in My Orders
              </button>
            </div>
          }
        />
      )}
    </PageShell>
  );
};

export default CustomerGallery;
