import type { Message } from "./types";
import {
  fetchGeneralMessages,
  fetchEventsFeed,
  fetchEventThread,
  postChatMessage,
} from "../api/chatApi";

function sortOldestFirst(a: Message, b: Message) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function sortNewestFirst(a: Message, b: Message) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export async function listGeneralMessages(
  groupId: string,
  opts?: { since?: string }
): Promise<Message[]> {
  const msgs = await fetchGeneralMessages(groupId, opts);
  return [...msgs].sort(sortOldestFirst);
}

export async function listEventMessages(groupId: string, eventId: string): Promise<Message[]> {
  const msgs = await fetchEventThread(groupId, eventId);
  return [...msgs].sort(sortOldestFirst);
}

export async function listEventsFeed(groupId: string): Promise<Message[]> {
  const msgs = await fetchEventsFeed(groupId);
  return [...msgs].sort(sortNewestFirst);
}

export async function sendMessage(params: {
  groupId: string;
  eventId?: string | null;
  fromUserId: string;
  text: string;
}): Promise<Message> {
  return await postChatMessage({
    groupId: params.groupId,
    eventId: params.eventId ?? null,
    text: params.text,
    fromUserId: params.fromUserId, // backend can ignore and use x-user-id
  });
}