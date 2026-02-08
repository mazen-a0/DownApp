import axios from "axios";

// Use your friend's Express server
export const API_BASE_URL = "http://10.121.185.25:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

// helper to set user header for requests
export function setUserIdHeader(userId: string) {
  api.defaults.headers.common["x-user-id"] = userId;
}