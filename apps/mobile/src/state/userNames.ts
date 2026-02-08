// src/state/userNames.ts
import { lookupUsers } from "../api/usersApi";
import { demoUsers } from "../data/demoUsers";

// in-memory cache (MVP)
const cache: Record<string, string> = {};

// seed demo users so u1/u2 resolve immediately
for (const [id, u] of Object.entries(demoUsers)) {
  if (u?.name) cache[id] = u.name;
}

/**
 * Ensure we have names cached for all ids.
 * Fetches only missing ids from backend.
 */
export async function ensureUserNames(ids: string[]) {
  const unique = Array.from(new Set((ids || []).filter(Boolean)));

  // if it's already in cache, don't fetch
  const missing = unique.filter((id) => !cache[id]);

  // Don't even try to lookup demo IDs like "u1", "u2"
  const looksLikeMongoId = (id: string) => /^[a-f0-9]{24}$/i.test(id);
  const missingMongoIds = missing.filter(looksLikeMongoId);

  if (missingMongoIds.length === 0) return;

  try {
    const found = await lookupUsers(missingMongoIds); // { [id]: name }
    Object.assign(cache, found);
  } catch (e){
        console.log("lookupUsers failed", e);

    // don't break UI if lookup fails
  }
}

/**
 * Read name from cache; fallback to demo user name; then short id.
 */
export function nameForUserId(userId: string) {
  if (!userId) return "Unknown";
  return cache[userId] ?? demoUsers[userId]?.name ?? userId.slice(-6);
}

/**
 * Optional: seed (e.g., current user name) for instant UI
 */
export function seedUserName(userId: string, name: string) {
  if (!userId || !name) return;
  cache[userId] = name;
}