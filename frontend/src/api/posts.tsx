import type { PostData, PostImage } from "../components/AddEditPost";

const API_BASE = "http://localhost:5000/api/posts";

export type PostStatus = "draft" | "published";

// The shape the form actually submits: price is still a raw string
// (e.g. "₹4,500") at this point — the server parses it, not the client.
export type PostFormPayload = Omit<PostData, "id" | "price" | "tags"> & {
  price: string;
  tags: string;
};

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  post?: T;
  posts?: T[];
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

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

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const data: ApiResponse<T> = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

// The server returns raw Mongoose docs (_id, tags: string[], images: string[]).
// Normalize that into the shape the form actually works with.
function normalizePost(raw: any): PostData {
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
  };
}

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

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  await handleResponse<never>(res);
}

export async function getTailorPosts(): Promise<PostData[]> {
  const res = await fetch(API_BASE, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await handleResponse<any>(res);
  return (data.posts ?? []).map(normalizePost);
}

export async function getPostById(id: string): Promise<PostData> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await handleResponse<any>(res);
  return normalizePost(data.post);
}