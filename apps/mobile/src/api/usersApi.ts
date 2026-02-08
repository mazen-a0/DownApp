import { api } from "./client";

export type UpsertUserInput = {
  name: string;
  deviceId: string;
  pushToken: string | null;
};

export type UpsertUserResponse = {
  userId: string;
};

export async function upsertUser(input: UpsertUserInput): Promise<UpsertUserResponse> {
  // Pick ONE route your Express server supports.
  // If your friend used something else, tell me the endpoint and I’ll match it.
  const res = await api.post("/users/upsert", input);
  return res.data as UpsertUserResponse;
}