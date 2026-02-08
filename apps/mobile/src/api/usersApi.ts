import { api } from "./client";

export type UpsertUserInput = {
  name: string;
  deviceId: string;
  pushToken: string | null;
};

export type UpsertUserResponse = {
  userId: string;
  name: string;
};

export async function upsertUser(input: UpsertUserInput): Promise<UpsertUserResponse> {
  const res = await api.post("/users/upsert", input);
  return res.data as UpsertUserResponse;
}

/**
 * POST /users/lookup
 * body: { ids: string[] }
 * returns: { users: { [id: string]: string } }
 */
export async function lookupUsers(ids: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set((ids || []).filter(Boolean)));
  if (unique.length === 0) return {};

  const res = await api.post("/users/lookup", { ids: unique });
  return (res.data?.users ?? {}) as Record<string, string>;
}