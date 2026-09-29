// Backend address. Set VITE_API_URL in frontend/.env (e.g. for a deployed backend);
// without it, local development uses http://localhost:5000.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
