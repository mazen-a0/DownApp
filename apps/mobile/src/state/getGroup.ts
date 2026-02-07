import { loadSession } from "./session";

export async function getGroupIdOrThrow(): Promise<string> {
  const s = await loadSession();
  if (!s.groupId) throw new Error("Missing groupId");
  return s.groupId;
}