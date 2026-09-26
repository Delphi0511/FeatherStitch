import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { formatPrice, thumbUrl } from "../api/posts.tsx";
import type { PostData } from "./AddEditPost";

interface PostDetailModalProps {
  post: PostData;
  onClose: () => void;
  /** Shown under the details, e.g. an Edit button for the owner. */
  footer?: ReactNode;
  /** Whether to show the Published/Draft badge (only meaningful to the owner). */
  showStatus?: boolean;
}

// Full-screen detail view of one post: photo switcher on the left, details on the right.
export default function PostDetailModal({ post, onClose, footer, showStatus = false }: PostDetailModalProps) {
  const [imageIndex, setImageIndex] = useState(0);

  // Lets Escape close the detail view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1426] border border-slate-700 grid md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photos */}
        <div className="bg-black flex flex-col">
          <div className="relative aspect-[4/5]">
            {post.images[imageIndex] ? (
              <img src={thumbUrl(post.images[imageIndex].url, 1400)} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🧵</div>
            )}
          </div>
          {post.images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {post.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setImageIndex(i)}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    i === imageIndex ? "border-emerald-400" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={thumbUrl(img.url, 160)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{post.category}</p>
              <h2 className="text-white text-2xl font-extrabold leading-tight">{post.title || "Untitled post"}</h2>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">
              ✕
            </button>
          </div>

          <p className="text-emerald-300 text-2xl font-extrabold mb-4">{formatPrice(post.price)}</p>

          <div className="flex flex-wrap gap-2 mb-5 text-xs">
            {post.turnaround && <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300">⏱ {post.turnaround}</span>}
            {showStatus && (
              <span
                className={`px-3 py-1 rounded-full ${
                  post.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-300"
                }`}
              >
                {post.status === "published" ? "Published" : "Draft"}
              </span>
            )}
          </div>

          {post.description && (
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-5">{post.description}</p>
          )}

          {post.tags && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {post.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 text-[11px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {footer && <div className="mt-auto">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
