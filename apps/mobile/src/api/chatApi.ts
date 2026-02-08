import { api } from "./client";
import type { Message } from "../repositories/types";

export async function fetchGeneralMessages(
  groupId: string,
  opts?: { since?: string }
): Promise<Message[]> {
  const params: any = { groupId };
  if (opts?.since) params.since = opts.since;

  const res = await api.get("/chat/general", { params });
  return (res.data ?? []) as Message[];
}

/**
 * GET /chat/events/feed?groupId=...
 */
export async function fetchEventsFeed(groupId: string): Promise<Message[]> {
  const res = await api.get("/chat/events/feed", { params: { groupId } });
  return (res.data ?? []) as Message[];
}

/**
 * GET /chat/events/:eventId
 * (Your route doesn’t require groupId, but passing it as a query param is harmless
 * and helps if your controller uses it.)
 */
export async function fetchEventThread(groupId: string, eventId: string): Promise<Message[]> {
  const res = await api.get(`/chat/events/${eventId}`, { params: { groupId } });
  return (res.data ?? []) as Message[];
}

/**
 * POST /chat/messages
 * body: { groupId, eventId, text }
 * fromUserId should be inferred from x-user-id, but we allow it optionally.
 */
export async function postChatMessage(input: {
  groupId: string;
  eventId?: string | null;
  text: string;
  fromUserId?: string;
}): Promise<Message> {
  const res = await api.post("/chat/messages", {
    groupId: input.groupId,
    eventId: input.eventId ?? null,
    text: input.text,
    // optional (backend can ignore)
    fromUserId: input.fromUserId,
  });

  return res.data as Message;
}