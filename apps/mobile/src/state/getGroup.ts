import { loadSession } from "./session";

/**
 * Hackathon-friendly:
 * - If groupId is missing (common in dev), fallback to "g1" so the app keeps working.
 * - When backend is live, you can revert this to a hard throw.
 */
export async function getGroupIdOrThrow(): Promise<string> {
  const s = await loadSession();
  if (s.groupId) return s.groupId;

  // DEMO FALLBACK (seeded group in demoGroupRepo)
  return "g1";
}