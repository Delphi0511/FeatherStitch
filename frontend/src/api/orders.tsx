import { ApiError } from "./posts.tsx";
import { API_URL } from "../config";

const API_BASE = `${API_URL}/api/orders`;

export type OrderStatus = "Pending" | "Accepted" | "In progress" | "Ready" | "Delivered" | "Declined" | "Cancelled";

export interface OrderMeasurement {
  gender: "male" | "female";
  type: string;
  values: Record<string, number | string>;
  units: Record<string, string>;
}

export interface Order {
  _id: string;
  customerUserId: string;
  customer: { email: string; name: string; address?: string; city?: string; state?: string };
  tailor: string;
  tailorName?: string;
  post?: string;
  design: { title: string; category?: string; image?: string; price?: number; turnaround?: string };
  measurements: OrderMeasurement[];
  notes?: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; by: "customer" | "tailor"; at: string }[];
  createdAt: string;
  updatedAt: string;
}

// The normal life of an order, used for progress trackers. Declined/Cancelled end it early.
export const ORDER_STEPS: OrderStatus[] = ["Pending", "Accepted", "In progress", "Ready", "Delivered"];

// Statuses grouped the way both order pages filter them.
export const ACTIVE_STATUSES: OrderStatus[] = ["Pending", "Accepted", "In progress", "Ready"];
export const CLOSED_STATUSES: OrderStatus[] = ["Declined", "Cancelled"];

// The tailor's next step for each status: [status to send, button label]. Mirrors the server rules.
export const TAILOR_NEXT_STEP: Partial<Record<OrderStatus, [OrderStatus, string]>> = {
  Accepted: ["In progress", "Start work"],
  "In progress": ["Ready", "Mark as ready"],
  Ready: ["Delivered", "Mark as delivered"],
};

// Readable names for measurement fields stored on orders.
export const MEASUREMENT_LABELS: Record<string, string> = {
  chest: "Chest", waist: "Waist", shoulderWidth: "Shoulder", sleeveLength: "Sleeve length", armhole: "Armhole",
  neck: "Neck", shirtLength: "Shirt length", bicep: "Bicep", wrist: "Wrist", bust: "Bust", underbust: "Underbust",
  apex: "Apex (bust point)", neckDepthFront: "Neck depth (front)", neckDepthBack: "Neck depth (back)",
  topLength: "Top length", hip: "Hip", thigh: "Thigh", knee: "Knee", calf: "Calf", inseam: "Inseam",
  outseam: "Outseam / length", ankleOpening: "Ankle opening", kurtiLength: "Kurti length",
  salwarLength: "Salwar length", lehengaLength: "Lehenga length", lehengaWaist: "Lehenga waist",
  lehengaFlare: "Lehenga flare", dupattaLength: "Dupatta length", blouseBackStyle: "Blouse back style",
};

const SECTION_LABELS: Record<string, string> = { upper: "Upper body", lower: "Lower body", trad: "Traditional" };

// e.g. { gender: "female", type: "trad" } -> "Women · Traditional"
export const sectionLabel = (m: { gender: string; type: string }) =>
  `${m.gender === "female" ? "Women" : "Men"} · ${SECTION_LABELS[m.type] || m.type}`;

// e.g. "2026-09-28T10:00:00Z" -> "28 Sept 2026"
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Sends an authenticated JSON request and turns error responses into ApiError.
async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.message || "Request failed", res.status);
  return data;
}

// ---- Customer ----

// A saved measurement section as returned by /api/measurements (numeric fields plus a units map).
export interface SavedMeasurement {
  _id: string;
  gender: "male" | "female";
  type: string;
  units?: Record<string, string>;
  [field: string]: unknown;
}

// Loads the signed-in customer's saved measurement sections so they can attach them to an order.
export async function listMyMeasurements(): Promise<SavedMeasurement[]> {
  let userId = "";
  try {
    userId = JSON.parse(localStorage.getItem("user") || "{}").userId || "";
  } catch {
    // Unreadable session: fall through with no id.
  }
  if (!userId) return [];
  const res = await fetch(`${API_URL}/api/measurements/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.message || "Could not load measurements", res.status);
  return data;
}

export async function placeOrder(input: { postId: string; measurementIds: string[]; notes: string }): Promise<Order> {
  const data = await request("", { method: "POST", body: JSON.stringify(input) });
  return data.order;
}

export async function listMyOrders(): Promise<Order[]> {
  return (await request("/mine")).orders;
}

export async function cancelOrder(id: string): Promise<Order> {
  return (await request(`/${id}/cancel`, { method: "PATCH" })).order;
}

// ---- Tailor ----

export async function listIncomingOrders(): Promise<Order[]> {
  return (await request("/incoming")).orders;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return (await request(`/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })).order;
}
