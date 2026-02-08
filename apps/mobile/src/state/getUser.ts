import { loadSession } from "./session";

export async function getUserIdOrThrow(): Promise<string> {
  const s = await loadSession();
  if (!s.userId) throw new Error("Missing userId");
  return s.userId;
}