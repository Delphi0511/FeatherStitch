import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTailorPosts, deletePost, ApiError, formatPrice } from "../api/posts.tsx";
import type { PostData } from "./AddEditPost";

type Filter = "all" | "published" | "draft";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

// Lists the signed-in tailor's posts and links each one to the add/edit form.
const MyPosts = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Posts belong to a tailor profile; the list endpoint returns 404 until one has been saved.
  const [needsProfile, setNeedsProfile] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getTailorPosts()
      .then(setPosts)
      .catch((err: Error) => {
        if (err instanceof ApiError && err.status === 404) setNeedsProfile(true);
        else setError(err.message || "Could not load your posts.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Uses a two-click confirmation, then removes the post (and its images) and drops it from the list.
  const handleDelete = async (id: string) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    setError("");
    setDeletingId(id);
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the post.");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  const counts: Record<Filter, number> = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
  };
  const visible = filter === "all" ? posts : posts.filter((p) => p.status === filter);

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
            <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Portfolio</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Posts</h1>
            <p className="text-slate-400 text-sm mt-1">Showcase your work. Drafts are only visible to you.</p>
          </div>
          {!needsProfile && (
            <button
              type="button"
              onClick={() => navigate("/posts/new")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white text-sm font-bold shadow-lg shadow-violet-900/40 transition-all"
            >
              + New post
            </button>
          )}
        </div>

        {/* Filters */}
        {posts.length > 0 && (
          <div className="flex gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filter === f.key
                    ? "bg-violet-500/15 border-violet-500 text-violet-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {f.label} <span className="opacity-60">{counts[f.key]}</span>
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
          <p className="text-slate-400 text-sm">Loading your posts…</p>
        ) : needsProfile ? (
          <div className="text-center border border-dashed border-cyan-700/60 rounded-2xl py-16 px-6">
            <div className="text-4xl mb-3">👤</div>
            <h2 className="text-white font-bold text-lg mb-1">Complete your profile first</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your posts are shown under your tailor profile, so save your profile before adding posts.
            </p>
            <button
              type="button"
              onClick={() => navigate("/tailorprofile")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-bold"
            >
              Go to my profile →
            </button>
          </div>
        ) : posts.length === 0 ? (
          !error && (
            <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
              <div className="text-4xl mb-3">✂️</div>
              <h2 className="text-white font-bold text-lg mb-1">No posts yet</h2>
              <p className="text-slate-400 text-sm mb-6">Add photos of your best work so customers can find you.</p>
              <button
                type="button"
                onClick={() => navigate("/posts/new")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold"
              >
                Create your first post
              </button>
            </div>
          )
        ) : visible.length === 0 ? (
          <p className="text-slate-400 text-sm">No {filter === "draft" ? "drafts" : "published posts"} yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800/40 flex flex-col"
              >
                {/* Cover */}
                <div className="relative h-48 bg-slate-900">
                  {post.images[0] ? (
                    <img src={post.images[0].url} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">🧵</div>
                  )}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                      post.status === "published"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-slate-700/90 text-slate-200"
                    }`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                  {post.images.length > 1 && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[11px] bg-black/60 text-white">
                      📷 {post.images.length}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-white font-bold text-base leading-snug mb-1">{post.title || "Untitled post"}</h3>
                  <p className="text-slate-400 text-xs mb-3">
                    {[post.category, post.turnaround].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-violet-300 font-extrabold text-lg mb-3">{formatPrice(post.price)}</p>
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 text-[11px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/posts/${post.id}/edit`)}
                      className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-200 text-sm font-semibold hover:border-violet-500 hover:text-violet-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      onBlur={() => setConfirmingId((id) => (id === post.id ? null : id))}
                      disabled={deletingId === post.id}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-60 ${
                        confirmingId === post.id
                          ? "border-red-500 bg-red-500/15 text-red-400"
                          : "border-red-500/40 text-red-400 hover:border-red-500"
                      }`}
                    >
                      {deletingId === post.id ? "Deleting…" : confirmingId === post.id ? "Confirm delete" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
