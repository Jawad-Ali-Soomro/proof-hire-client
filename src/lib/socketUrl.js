import { API_BASE } from "./api.js";

/** Socket.IO server origin (no /api prefix). */
export function getSocketOrigin() {
  const explicit = import.meta.env.VITE_WS_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const base = API_BASE.replace(/\/api\/?$/, "");
  return base || "http://localhost:3000";
}
