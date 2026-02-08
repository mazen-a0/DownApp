import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { loadSession } from "../state/session";

export const API_BASE_URL = "http://10.122.74.204:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

// --- user header helpers ---
export function setUserIdHeader(userId: string) {
  api.defaults.headers.common["x-user-id"] = userId;
}

export function clearUserIdHeader() {
  delete api.defaults.headers.common["x-user-id"];
}

/**
 * Always attach x-user-id for authenticated calls.
 * This prevents “restart app and header disappeared” bugs.
 */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Axios may give url like "groups/123" or "/groups/123"
  const rawUrl = config.url || "";
  const url = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;

  // Endpoints that must work WITHOUT x-user-id (bootstrap + health)
  // Keep this list SMALL on purpose.
  const allowNoUserHeader =
    url === "/health" ||
    url === "/" ||
    url === "/users/upsert";

  if (allowNoUserHeader) return config;

  // If header not already set, pull it from AsyncStorage session
  const existing =
    (config.headers as any)?.["x-user-id"] ??
    (api.defaults.headers.common as any)?.["x-user-id"];

  if (!existing) {
    const s = await loadSession();
    if (s.userId) {
      config.headers = (config.headers || {}) as any;
      (config.headers as any)["x-user-id"] = s.userId;

      // also set defaults so next calls are cheap
      api.defaults.headers.common["x-user-id"] = s.userId;
    }
  }

  return config;
});