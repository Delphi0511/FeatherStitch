import type { PostData } from "../components/AddEditPost";
import { ApiError, normalizePost } from "./posts.tsx";
import { API_URL } from "../config";

const API_BASE = `${API_URL}/api/public`;

// A tailor as customers see them: only the fields the server publishes.
export interface PublicTailor {
  _id: string;
  name?: string;
  category?: string;
  speciality?: string;
  workType?: string;
  since?: string;
  city?: string;
  state?: string;
  shopAddress?: string;
  shopCity?: string;
  website?: string;
  otherInfo?: string;
  profilePic?: string;
  postCount: number;
  /** Up to 3 newest published posts, for design thumbnails in the tailor list. */
  previews?: { _id: string; title: string; image?: string }[];
}

// Performs an authenticated GET and turns error responses into ApiError.
async function getJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.message || "Request failed", res.status);
  return data;
}

// Lists tailors, optionally filtered by city and a search term (name, speciality, category).
export async function listTailors(params: { city?: string; q?: string } = {}): Promise<PublicTailor[]> {
  const query = new URLSearchParams();
  if (params.city?.trim()) query.set("city", params.city.trim());
  if (params.q?.trim()) query.set("q", params.q.trim());
  query.set("limit", "100");
  const data = await getJson(`/tailors?${query}`);
  return data.tailors;
}

// Loads one published design with the public profile of the tailor who posted it.
export async function getPublishedPost(id: string): Promise<{ post: PostData; tailor: PublicTailor }> {
  const data = await getJson(`/posts/${encodeURIComponent(id)}`);
  return { post: normalizePost(data.post), tailor: data.post.tailor };
}

// Loads one tailor's public profile together with their published posts.
export async function getTailorProfile(id: string): Promise<{ tailor: PublicTailor; posts: PostData[] }> {
  const data = await getJson(`/tailors/${encodeURIComponent(id)}`);
  return { tailor: data.tailor, posts: data.posts.map(normalizePost) };
}
