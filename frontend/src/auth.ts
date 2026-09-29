// Session helpers: the login token and user live in localStorage (set by Login.tsx).

export type Role = "Customer" | "Tailor";

export interface Session {
  token: string;
  userId: string;
  email: string;
  usertype: Role;
}

// Reads the JWT's expiry (seconds since epoch) without verifying it; the server still verifies every request.
function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Returns the signed-in user, or null if there is no valid, unexpired session (stale data is cleared).
export function getSession(): Session | null {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;

  let user: Partial<Session> = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    clearSession();
    return null;
  }

  const exp = tokenExpiry(token);
  const expired = exp !== null && exp * 1000 <= Date.now();
  if (expired || (user.usertype !== "Customer" && user.usertype !== "Tailor")) {
    clearSession();
    return null;
  }
  return { token, userId: user.userId || "", email: user.email || "", usertype: user.usertype };
}

// Where each role lands after signing in.
export const dashboardFor = (role: Role) => (role === "Tailor" ? "/tailordashboard" : "/customerdashboard");
