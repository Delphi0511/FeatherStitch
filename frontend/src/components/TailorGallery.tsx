import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTailorPosts, ApiError, formatPrice } from "../api/posts.tsx";
import type { PostData } from "./AddEditPost";

// Shows every post of the signed-in tailor as a browsable portfolio, with a detail view per post.
const TailorGallery = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);
  const [category, setCategory] = useState("All");
  const [openPost, setOpenPost] = useState<PostData | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    getTailorPosts()
      .then(setPosts)
      .catch((err: Error) => {
        if (err instanceof ApiError && err.status === 404) setNeedsProfile(true);
        else setError(err.message || "Could not load your gallery.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Lets Escape close the detail view.
  useEffect(() => {
    if (!openPost) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenPost(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPost]);

  const openDetail = (post: PostData) => {
    setOpenPost(post);
    setImageIndex(0);
  };

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const visible = category === "All" ? posts : posts.filter((p) => p.category === category);
  const photoCount = posts.reduce((sum, p) => sum + p.images.length, 0);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 50%, #0f2040 100%)" }}
    >
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800">
        <button
          type="button"
          onClick={() => navigate("/tailordashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FeatherStitch</span>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Portfolio</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Gallery</h1>
            <p className="text-slate-400 text-sm mt-1">
              {posts.length > 0
                ? `${posts.length} ${posts.length === 1 ? "creation" : "creations"} · ${photoCount} ${photoCount === 1 ? "photo" : "photos"}`
                : "Your complete portfolio of creations."}
            </p>
          </div>
          {!needsProfile && (
            <button
              type="button"
              onClick={() => navigate("/posts")}
              className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-200 hover:border-emerald-500 hover:text-emerald-300 text-sm font-semibold transition-colors"
            >
              Manage posts
            </button>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  category === c
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading your gallery…</p>
        ) : needsProfile ? (
          <div className="text-center border border-dashed border-cyan-700/60 rounded-2xl py-16 px-6">
            <div className="text-4xl mb-3">👤</div>
            <h2 className="text-white font-bold text-lg mb-1">Complete your profile first</h2>
            <p className="text-slate-400 text-sm mb-6">Your gallery shows the posts saved under your tailor profile.</p>
            <button
              type="button"
              onClick={() => navigate("/tailorprofile")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-sm font-bold"
            >
              Go to my profile →
            </button>
          </div>
        ) : posts.length === 0 ? (
          !error && (
            <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
              <div className="text-4xl mb-3">🖼️</div>
              <h2 className="text-white font-bold text-lg mb-1">Your gallery is empty</h2>
              <p className="text-slate-400 text-sm mb-6">Posts you add will appear here.</p>
              <button
                type="button"
                onClick={() => navigate("/posts/new")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-bold"
              >
                Add your first post
              </button>
            </div>
          )
        ) : (
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => openDetail(post)}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 text-left"
              >
                {post.images[0] ? (
                  <img
                    src={post.images[0].url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🧵</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
                  {post.status === "draft" ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-slate-700/90 text-slate-200">
                      Draft
                    </span>
                  ) : (
                    <span />
                  )}
                  {post.images.length > 1 && (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-black/60 text-white">📷 {post.images.length}</span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest mb-1">{post.category}</p>
                  <h3 className="text-white font-bold text-base leading-snug">{post.title || "Untitled post"}</h3>
                  <p className="text-slate-200 text-sm font-semibold mt-1">{formatPrice(post.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail view */}
      {openPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenPost(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={openPost.title}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1426] border border-slate-700 grid md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photos */}
            <div className="bg-black flex flex-col">
              <div className="relative aspect-[4/5]">
                {openPost.images[imageIndex] ? (
                  <img src={openPost.images[imageIndex].url} alt={openPost.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🧵</div>
                )}
              </div>
              {openPost.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {openPost.images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      aria-label={`Photo ${i + 1}`}
                      onClick={() => setImageIndex(i)}
                      className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        i === imageIndex ? "border-emerald-400" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{openPost.category}</p>
                  <h2 className="text-white text-2xl font-extrabold leading-tight">{openPost.title || "Untitled post"}</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpenPost(null)}
                  className="text-slate-400 hover:text-white text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              <p className="text-emerald-300 text-2xl font-extrabold mb-4">{formatPrice(openPost.price)}</p>

              <div className="flex flex-wrap gap-2 mb-5 text-xs">
                {openPost.turnaround && (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300">⏱ {openPost.turnaround}</span>
                )}
                <span
                  className={`px-3 py-1 rounded-full ${
                    openPost.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {openPost.status === "published" ? "Published" : "Draft"}
                </span>
              </div>

              {openPost.description && (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-5">{openPost.description}</p>
              )}

              {openPost.tags && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {openPost.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 text-[11px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate(`/posts/${openPost.id}/edit`)}
                className="mt-auto w-full py-2.5 rounded-xl border border-slate-600 text-slate-200 text-sm font-semibold hover:border-emerald-500 hover:text-emerald-300 transition-colors"
              >
                Edit post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TailorGallery;
