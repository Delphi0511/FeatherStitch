import type { PostData, PostImage } from "../components/AddEditPost";

const API_BASE = "http://localhost:5000/api/posts";

export type PostStatus = "draft" | "published";

// The shape the form actually submits: price is still a raw string
// (e.g. "₹4,500") at this point — the server parses it, not the client.
export type PostFormPayload = Omit<PostData, "id" | "price" | "tags" | "status"> & {
  price: string;
  tags: string;
};

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  post?: T;
  posts?: T[];
}

// Reads the current JWT so post requests can identify the signed-in tailor.
function getToken(): string | null {
  return localStorage.getItem("token");
}

// Builds the bearer-auth header required by protected post endpoints.
function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

// Encodes post fields and optional image files as multipart data for Cloudinary uploads.
function buildFormData(postData: PostFormPayload, status: PostStatus): FormData {
  const formData = new FormData();

  formData.append("title", postData.title);
  formData.append("category", postData.category);
  formData.append("turnaround", postData.turnaround);
  formData.append("description", postData.description);
  formData.append("price", postData.price);
  formData.append("tags", postData.tags);
  formData.append("status", status === "published" ? "Published" : "Draft");

  const existingImageUrls = postData.images
    .filter((img) => !img.file)
    .map((img) => img.url);

  formData.append("existingImages", JSON.stringify(existingImageUrls));

  postData.images.forEach((img) => {
    if (img.file) {
      formData.append("images", img.file);
    }
  });

  return formData;
}

// Asks Cloudinary for a resized copy so grids don't download full-size photos.
// Non-Cloudinary URLs (e.g. local blob previews) are returned unchanged.
export const thumbUrl = (url: string, width = 600) =>
  url.includes("res.cloudinary.com") && url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/c_limit,w_${width},q_auto,f_auto/`)
    : url;

// Formats a stored numeric price for display, e.g. 14500 -> "₹14,500".
export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

// Carries the HTTP status so screens can react to specific failures (e.g. 404 = no tailor profile yet).
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Converts API responses into a consistent result and surfaces server error messages to the UI.
async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const data: ApiResponse<T> = await res.json();
  if (!res.ok) {
    throw new ApiError(data.message || "Request failed", res.status);
  }
  return data;
}

// The server returns raw Mongoose docs (_id, tags: string[], images: string[]).
// Normalize that into the shape the form actually works with.
// Adapts MongoDB post fields to the form's client-side data shape.
export function normalizePost(raw: any): PostData {
  const images: PostImage[] = (raw.images ?? []).map((url: string) => ({
    id: url,
    url,
  }));

  return {
    id: raw._id ?? raw.id,
    title: raw.title ?? "",
    category: raw.category ?? "",
    turnaround: raw.turnaround ?? "",
    description: raw.description ?? "",
    price: raw.price ?? 0,
    tags: Array.isArray(raw.tags) ? raw.tags.join(", ") : raw.tags ?? "",
    images,
    status: raw.status === "Published" ? "published" : "draft",
  };
}

// Sends a new authenticated tailor post to the API and returns form-ready data.
export async function createPost(
  postData: PostFormPayload,
  status: PostStatus
): Promise<PostData> {
  const formData = buildFormData(postData, status);

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const data = await handleResponse<any>(res);
  return normalizePost(data.post);
}

// Saves edits to an existing post while preserving the selected status and images.
export async function updatePost(
  id: string,
  postData: PostFormPayload,
  status: PostStatus
): Promise<PostData> {
  const formData = buildFormData(postData, status);

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

  const data = await handleResponse<any>(res);
  return normalizePost(data.post);
}

// Removes a post through the authenticated API so its server-side images are also cleaned up.
export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  await handleResponse<never>(res);
}

// Loads the signed-in tailor's portfolio posts for a future list or gallery view.
export async function getTailorPosts(): Promise<PostData[]> {
  const res = await fetch(API_BASE, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await handleResponse<any>(res);
  return (data.posts ?? []).map(normalizePost);
}

// Loads one authorized post for editing.
export async function getPostById(id: string): Promise<PostData> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await handleResponse<any>(res);
  return normalizePost(data.post);
}
