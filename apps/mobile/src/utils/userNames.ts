import { lookupUsers } from "../api/usersApi";

// in-memory cache (MVP)
const cache: Record<string, string> = {};

export async function ensureUserNames(ids: string[]) {
  const unique = Array.from(new Set((ids || []).filter(Boolean)));
  const missing = unique.filter((id) => !cache[id]);

  if (missing.length === 0) return;

  const found = await lookupUsers(missing);
  Object.assign(cache, found);
}

export function nameForUserId(userId: string) {
  if (!userId) return "Unknown";
  return cache[userId] ?? userId; // ✅ no more last-6 fallback
}

export function seedUserName(userId: string, name: string) {
  if (!userId || !name) return;
  cache[userId] = name;
}