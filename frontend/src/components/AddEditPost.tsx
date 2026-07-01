import React, { useState, useRef } from "react";
import { createPost, updatePost, deletePost } from "../api/posts.tsx";

// ---- Types -----------------------------------------------------------

export interface PostImage {
  id: string;
  url: string;
  file?: File;
}

export interface PostData {
  id: string;
  title: string;
  category: string;
  turnaround: string;
  description: string;
  price: number;
  tags: string;
  images: PostImage[];
}

interface AddEditPostCardProps {
  /** Pass an existing post to render edit mode; omit for add mode */
  post?: PostData;
  /** Called after a successful create/update, with the saved post from the server */
  onSaved?: (savedPost: any) => void;
  /** Called after a successful delete */
  onDeleted?: (id: string) => void;
  onCancel?: () => void;
}

const CATEGORIES = ["Sherwani", "Suit", "Casual wear", "Bridal wear", "Alterations"];
const TURNAROUNDS = ["3-5 days", "1 week", "2 weeks", "3+ weeks"];
const MAX_IMAGES = 6;

// ---- Component ---------------------------------------------------------

export default function AddEditPostCard({ post, onSaved, onDeleted, onCancel }: AddEditPostCardProps) {
  const isEditMode = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? CATEGORIES[0]);
  const [turnaround, setTurnaround] = useState(post?.turnaround ?? TURNAROUNDS[0]);
  const [description, setDescription] = useState(post?.description ?? "");
  const [price, setPrice] = useState<string>(post?.price != null ? String(post.price) : "");
  const [tags, setTags] = useState(post?.tags ?? "");
  const [images, setImages] = useState<PostImage[]>(post?.images ?? []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const next = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
        file,
      }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSave = async (status: "draft" | "published") => {
    setError(null);
    setSaving(true);

    const payload = {
      title,
      category,
      turnaround,
      description,
      price,
      tags,
      images,
    };

    try {
      const savedPost = isEditMode
        ? await updatePost(post!.id, payload, status)
        : await createPost(payload, status);

      onSaved?.(savedPost);
    } catch (err: any) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    if (!post) return;

    setError(null);
    setDeleting(true);
    try {
      await deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err: any) {
      setError(err.message || "Something went wrong while deleting.");
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.headerLeft}>
          <button type="button" aria-label="Back" style={styles.iconButton} onClick={onCancel}>
            <BackIcon />
          </button>
          <span style={styles.headerIconWrap}>
            <PencilIcon />
          </span>
          <h1 style={styles.headerTitle}>{isEditMode ? "Edit post" : "Add post"}</h1>
        </div>
        <button type="button" aria-label="Close" style={styles.iconButton} onClick={onCancel}>
          <CloseIcon />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={styles.content}>
        <div style={styles.inner}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          {/* Photos */}
          <div style={styles.section}>
            <label style={styles.label}>Photos</label>

            {images.length === 0 ? (
              <div
                style={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <UploadIcon />
                <p style={styles.dropzoneTitle}>Drag photos here or browse</p>
                <p style={styles.dropzoneHint}>Up to {MAX_IMAGES} images, JPG or PNG</p>
              </div>
            ) : (
              <div style={styles.thumbGrid}>
                {images.map((img) => (
                  <div key={img.id} style={styles.thumb}>
                    <img src={img.url} alt="" style={styles.thumbImg} />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      style={styles.thumbRemove}
                      onClick={() => removeImage(img.id)}
                    >
                      <CloseIcon size={12} />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    aria-label="Add photo"
                    style={styles.thumbAdd}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PlusIcon />
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Title */}
          <div style={styles.section}>
            <label style={styles.label} htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              style={styles.input}
              placeholder="Royal blue wedding sherwani"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category / Turnaround */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="post-category">
                Category
              </label>
              <select
                id="post-category"
                style={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="post-turnaround">
                Turnaround time
              </label>
              <select
                id="post-turnaround"
                style={styles.select}
                value={turnaround}
                onChange={(e) => setTurnaround(e.target.value)}
              >
                {TURNAROUNDS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <label style={styles.label} htmlFor="post-description">
              Description
            </label>
            <textarea
              id="post-description"
              rows={4}
              style={styles.textarea}
              placeholder="Describe the fabric, fit, and craftsmanship"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Price / Tags */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="post-price">
                Starting price
              </label>
              <input
                id="post-price"
                type="text"
                style={styles.input}
                placeholder="₹4,500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="post-tags">
                Tags
              </label>
              <input
                id="post-tags"
                type="text"
                style={styles.input}
                placeholder="wedding, festive, silk"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div style={styles.footer}>
        <div style={styles.footerInner}>
          {isEditMode ? (
            <button
              type="button"
              style={confirmingDelete ? styles.dangerButtonConfirm : styles.dangerButton}
              onClick={handleDeleteClick}
              onBlur={() => setConfirmingDelete(false)}
              disabled={deleting}
            >
              <TrashIcon />
              {deleting ? "Deleting..." : confirmingDelete ? "Confirm delete" : "Delete post"}
            </button>
          ) : (
            <span />
          )}

          <div style={styles.footerRight}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => handleSave("draft")}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save as draft"}
            </button>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => handleSave("published")}
              disabled={saving}
            >
              {saving ? "Saving..." : isEditMode ? "Update post" : "Publish post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Icons (inline, no external icon library required) -----------------

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Styles (matches the dark dashboard + purple "edit" accent) --------

const PURPLE = "#a855f7";
const PURPLE_DARK = "#7c3aed";
const RED = "#ef4444";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#0a0e1a",
    color: "#e5e7eb",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "#0a0e1a",
  },
  content: {
    flex: 1,
    width: "100%",
    overflowY: "auto",
    padding: "2rem",
    boxSizing: "border-box",
  },
  inner: {
    maxWidth: 720,
    margin: "0 auto",
    width: "100%",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
  },
  headerTitle: { fontSize: 17, fontWeight: 600, margin: 0, color: "#f8fafc" },
  iconButton: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: 4,
    display: "flex",
  },
  errorBanner: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fca5a5",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    marginBottom: "1rem",
  },
  section: { marginBottom: "1.1rem" },
  label: {
    display: "block",
    fontSize: 12.5,
    color: "#9ca3af",
    marginBottom: 6,
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: "1.1rem" },
  field: {},
  input: {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#161c30",
    color: "#f3f4f6",
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#161c30",
    color: "#f3f4f6",
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#161c30",
    color: "#f3f4f6",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  dropzone: {
    border: "1px dashed rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "1.5rem",
    textAlign: "center",
    background: "#0c1020",
    color: "#9ca3af",
    cursor: "pointer",
  },
  dropzoneTitle: { fontSize: 13, color: "#d1d5db", margin: "8px 0 2px" },
  dropzoneHint: { fontSize: 12, color: "#6b7280", margin: 0 },
  thumbGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  thumb: {
    position: "relative",
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#1f2433",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  thumbAdd: {
    width: 64,
    height: 64,
    borderRadius: 8,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "#0c1020",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  footer: {
    position: "sticky",
    bottom: 0,
    zIndex: 10,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "#0a0e1a",
    padding: "1rem 2rem",
  },
  footerInner: {
    maxWidth: 720,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerRight: { display: "flex", gap: 8 },
  secondaryButton: {
    height: 36,
    padding: "0 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: 13.5,
    cursor: "pointer",
  },
  primaryButton: {
    height: 36,
    padding: "0 16px",
    borderRadius: 8,
    border: "none",
    background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
    color: "#fff",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  dangerButton: {
    display: "flex",
    alignItems: "center",
    height: 36,
    padding: "0 12px",
    borderRadius: 8,
    border: `1px solid rgba(239,68,68,0.35)`,
    background: "transparent",
    color: RED,
    fontSize: 13.5,
    cursor: "pointer",
  },
  dangerButtonConfirm: {
    display: "flex",
    alignItems: "center",
    height: 36,
    padding: "0 12px",
    borderRadius: 8,
    border: `1px solid ${RED}`,
    background: "rgba(239,68,68,0.12)",
    color: RED,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
};
