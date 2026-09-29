import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTailorProfile } from "../api/public.tsx";
import type { PublicTailor } from "../api/public.tsx";
import { formatPrice, thumbUrl } from "../api/posts.tsx";
import type { PostData } from "./AddEditPost";
import PostDetailModal from "./PostDetailModal";
import { TailorAvatar } from "./FindTailor";

// A tailor's public page for customers: profile details and all of their published designs.
const TailorPublicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tailor, setTailor] = useState<PublicTailor | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [openPost, setOpenPost] = useState<PostData | null>(null);
  const closeDetail = useCallback(() => setOpenPost(null), []);

  useEffect(() => {
    if (!id) return;
    getTailorProfile(id)
      .then((result) => {
        setTailor(result.tailor);
        setPosts(result.posts);
      })
      .catch((err: Error) => setError(err.message || "Could not load this tailor."));
  }, [id]);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const visible = category === "All" ? posts : posts.filter((p) => p.category === category);

  const details = tailor
    ? [
        { label: "Speciality", value: tailor.speciality },
        { label: "Category", value: tailor.category },
        { label: "Work type", value: tailor.workType },
        { label: "In business since", value: tailor.since },
        { label: "Shop", value: [tailor.shopAddress, tailor.shopCity].filter(Boolean).join(", ") },
        { label: "Based in", value: [tailor.city, tailor.state].filter(Boolean).join(", ") },
      ].filter((d) => d.value)
    : [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 50%, #0f2040 100%)" }}
    >
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800">
        <button
          type="button"
          onClick={() => navigate("/findtailor")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← All tailors
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FeatherStitch</span>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-10">
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <button type="button" onClick={() => navigate("/findtailor")} className="text-violet-300 hover:text-violet-200 text-sm">
              ← Back to all tailors
            </button>
          </div>
        ) : !tailor ? (
          <p className="text-slate-400 text-sm">Loading tailor…</p>
        ) : (
          <>
            {/* Profile */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 md:p-8 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                <TailorAvatar tailor={tailor} size="w-24 h-24 text-3xl" />
                <div>
                  <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-1">Tailor</p>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{tailor.name || "Unnamed tailor"}</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    {tailor.postCount} published {tailor.postCount === 1 ? "design" : "designs"}
                  </p>
                </div>
              </div>

              {details.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                  {details.map((d) => (
                    <div key={d.label}>
                      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{d.label}</p>
                      <p className="text-slate-200 text-sm">{d.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {tailor.otherInfo && (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-slate-700/60 pt-5">
                  {tailor.otherInfo}
                </p>
              )}

              {tailor.website && (
                <a
                  href={/^https?:\/\//i.test(tailor.website) ? tailor.website : `https://${tailor.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-violet-300 hover:text-violet-200 text-sm font-semibold"
                >
                  🌐 {tailor.website}
                </a>
              )}
            </div>

            {/* Designs */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-extrabold text-white">Designs</h2>
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        category === c
                          ? "bg-violet-500/15 border-violet-500 text-violet-300"
                          : "border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center border border-dashed border-slate-700 rounded-2xl py-14 px-6 text-slate-400 text-sm">
                This tailor hasn't posted any designs yet.
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
                {visible.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setOpenPost(post)}
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 text-left"
                  >
                    {post.images[0] ? (
                      <img
                        src={thumbUrl(post.images[0].url)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🧵</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    {post.images.length > 1 && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[11px] bg-black/60 text-white">
                        📷 {post.images.length}
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-violet-300 text-[11px] font-bold uppercase tracking-widest mb-1">{post.category}</p>
                      <h3 className="text-white font-bold text-base leading-snug">{post.title || "Untitled design"}</h3>
                      <p className="text-slate-200 text-sm font-semibold mt-1">{formatPrice(post.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {openPost && (
        <PostDetailModal
          post={openPost}
          onClose={closeDetail}
          footer={
            <button
              type="button"
              onClick={() => navigate(`/order/${openPost.id}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white text-sm font-bold shadow-lg shadow-violet-900/40 transition-all"
            >
              Order this design →
            </button>
          }
        />
      )}
    </div>
  );
};

export default TailorPublicPage;
