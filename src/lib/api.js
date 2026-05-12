const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const TOKEN_KEY = "proof-hire-token";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * @param {string} path - e.g. "/auth/wallet"
 * @param {{ method?: string, body?: object, token?: string | null }} options
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token = getStoredToken() } = options;
  /** @type {Record<string, string>} */
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  /** @type {unknown} */
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (data && typeof data === "object" && "message" in data) {
      const m = data.message;
      if (typeof m === "string") msg = m;
      else if (Array.isArray(m)) msg = m.join(", ");
    }
    throw new Error(msg);
  }

  return data;
}

/**
 * Multipart upload (do not set Content-Type; browser sets boundary).
 * @param {string} path - e.g. "/profile/upload-image"
 * @param {FormData} formData
 * @param {string | null} [token]
 */
export async function apiUploadFile(path, formData, token = getStoredToken()) {
  /** @type {Record<string, string>} */
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await res.text();
  /** @type {unknown} */
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (data && typeof data === "object" && "message" in data) {
      const m = data.message;
      if (typeof m === "string") msg = m;
      else if (Array.isArray(m)) msg = m.join(", ");
    }
    throw new Error(msg);
  }

  return data;
}

export { API_BASE, TOKEN_KEY };
