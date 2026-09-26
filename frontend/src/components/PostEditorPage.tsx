import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddEditPost from "./AddEditPost";
import type { PostData } from "./AddEditPost";
import { getPostById } from "../api/posts.tsx";

// Route wrapper for /posts/new and /posts/:id/edit: loads the post when editing
// and returns to the post list after save, delete or cancel.
const PostEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPostById(id)
      .then(setPost)
      .catch((err: Error) => setError(err.message || "Could not load this post."));
  }, [id]);

  const backToList = () => navigate("/posts");

  if (!id) {
    return <AddEditPost onSaved={backToList} onCancel={backToList} />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0e1a] text-slate-300 text-sm">
        {error ? <p className="text-red-400">⚠️ {error}</p> : <p>Loading post…</p>}
        {error && (
          <button type="button" onClick={backToList} className="text-violet-300 hover:text-violet-200">
            ← Back to my posts
          </button>
        )}
      </div>
    );
  }

  // The form seeds its state from `post` once, so it only mounts after the post has loaded.
  return <AddEditPost post={post} onSaved={backToList} onDeleted={backToList} onCancel={backToList} />;
};

export default PostEditorPage;
