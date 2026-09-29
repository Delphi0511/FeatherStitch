import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublishedPost } from "../api/public.tsx";
import type { PublicTailor } from "../api/public.tsx";
import { formatPrice, thumbUrl } from "../api/posts.tsx";
import { listMyMeasurements, MEASUREMENT_LABELS, placeOrder, sectionLabel } from "../api/orders.tsx";
import type { SavedMeasurement } from "../api/orders.tsx";
import type { PostData } from "./AddEditPost";
import { PageShell } from "./OrderBits";

const NOTES_LIMIT = 1000;

// Short "Chest 40 in · Waist 34 in · …" preview of a saved measurement section.
function previewOf(m: SavedMeasurement) {
  const filled = Object.keys(MEASUREMENT_LABELS).filter((k) => m[k] !== undefined && m[k] !== null && m[k] !== "");
  const shown = filled.slice(0, 4).map((k) => `${MEASUREMENT_LABELS[k]} ${m[k]}${m.units?.[k] ? ` ${m.units[k]}` : ""}`);
  return { count: filled.length, text: shown.join(" · ") + (filled.length > 4 ? " · …" : "") };
}

// Lets a customer order one published design: pick measurements to attach, add notes, confirm.
const OrderDesignPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostData | null>(null);
  const [tailor, setTailor] = useState<PublicTailor | null>(null);
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!postId) return;
    Promise.all([getPublishedPost(postId), listMyMeasurements()])
      .then(([result, saved]) => {
        setPost(result.post);
        setTailor(result.tailor);
        // Only sections with at least one value are worth attaching; all are pre-selected.
        const usable = saved.filter((m) => previewOf(m).count > 0);
        setMeasurements(usable);
        setSelected(new Set(usable.map((m) => m._id)));
      })
      .catch((err: Error) => setLoadError(err.message || "Could not load this design."));
  }, [postId]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handlePlaceOrder = async () => {
    if (!post) return;
    setPlacing(true);
    setSubmitError("");
    try {
      await placeOrder({ postId: post.id, measurementIds: [...selected], notes });
      navigate("/orders", { state: { placed: post.title } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not place the order.");
      setPlacing(false);
    }
  };

  const needsProfile = submitError.includes("Complete your profile");

  return (
    <PageShell backTo={tailor ? `/tailors/${tailor._id}` : "/findtailor"} backLabel={tailor?.name ? `Back to ${tailor.name}` : "Back"}>
      {loadError ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">⚠️ {loadError}</p>
          <button type="button" onClick={() => navigate("/findtailor")} className="text-violet-300 hover:text-violet-200 text-sm">
            ← Find a tailor
          </button>
        </div>
      ) : !post ? (
        <p className="text-slate-400 text-sm">Loading design…</p>
      ) : (
        <div className="max-w-3xl mx-auto">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">New order</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Order this design</h1>

          {/* Design summary */}
          <div className="flex gap-5 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 mb-6">
            <div className="w-28 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900">
              {post.images[0] ? (
                <img src={thumbUrl(post.images[0].url, 300)} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🧵</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-violet-300 text-[11px] font-bold uppercase tracking-widest">{post.category}</p>
              <h2 className="text-white text-xl font-bold leading-snug">{post.title}</h2>
              <p className="text-slate-400 text-sm mt-0.5">by {tailor?.name || "this tailor"}</p>
              <p className="text-emerald-300 text-xl font-extrabold mt-2">{formatPrice(post.price)}</p>
              {post.turnaround && <p className="text-slate-400 text-xs mt-1">⏱ Usually ready in {post.turnaround}</p>}
            </div>
          </div>

          {/* Measurements */}
          <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 mb-6">
            <h3 className="text-white font-bold mb-1">Measurements to share</h3>
            <p className="text-slate-400 text-xs mb-4">The tailor will see the sections you tick, exactly as saved now.</p>
            {measurements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-600 p-4 text-sm text-slate-400">
                You haven't saved any measurements yet. You can still place the order, or{" "}
                <button type="button" onClick={() => navigate("/measurements")} className="text-cyan-300 hover:text-cyan-200 font-semibold">
                  add your measurements first →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {measurements.map((m) => {
                  const preview = previewOf(m);
                  return (
                    <label
                      key={m._id}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        selected.has(m._id) ? "border-violet-500/70 bg-violet-500/10" : "border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(m._id)}
                        onChange={() => toggle(m._id)}
                        className="mt-1 accent-violet-500"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-100">
                          {sectionLabel(m)} <span className="text-slate-500 font-normal">· {preview.count} measurements</span>
                        </span>
                        <span className="block text-xs text-slate-400 truncate">{preview.text}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 mb-6">
            <label htmlFor="order-notes" className="block text-white font-bold mb-1">Notes for the tailor</label>
            <p className="text-slate-400 text-xs mb-3">Optional: fabric, colour, fit or deadline preferences.</p>
            <textarea
              id="order-notes"
              rows={4}
              maxLength={NOTES_LIMIT}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Slightly longer sleeves, needed before 15 November"
              className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
            <p className="text-right text-[11px] text-slate-500 mt-1">{notes.length}/{NOTES_LIMIT}</p>
          </section>

          {submitError && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">
              ⚠️ {submitError}
              {needsProfile && (
                <button type="button" onClick={() => navigate("/customerprofile")} className="ml-2 underline font-semibold">
                  Go to my profile
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-500 text-xs">No payment now. The tailor will review your order first.</p>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-violet-900/40 transition-all"
            >
              {placing ? "Placing order…" : `Place order · ${formatPrice(post.price)}`}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default OrderDesignPage;
