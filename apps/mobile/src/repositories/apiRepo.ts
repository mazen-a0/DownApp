import dayjs from "dayjs";
import { loadSession } from "../state/session";
import type { Event, EventTag } from "./types";
import {
  fetchEvents,
  createEvent as apiCreateEvent,
  joinEvent as apiJoin,
  leaveEvent as apiLeave,
  checkIn as apiCheckIn,
  checkout as apiCheckout,
    pokeEvent as apiPokeEvent, // ✅ add
} from "../api/eventsApi";

export async function listEvents(): Promise<Event[]> {
  const session = await loadSession();
  if (!session.groupId) return [];

  const from = dayjs().startOf("day").toISOString();
  const to = dayjs().add(1, "day").startOf("day").toISOString();

  return await fetchEvents({ groupId: session.groupId, from, to });
}

export async function createEvent(input: {
  title: string;
  tag: EventTag;
  startAt: string;
  endAt: string;
  placeLabel?: string;

  // ✅ NEW
  emoji?: string | null;
}): Promise<Event> {
  const session = await loadSession();
  if (!session.groupId) throw new Error("No group selected yet.");

  return await apiCreateEvent({
    groupId: session.groupId,
    title: input.title,
    tag: input.tag,
    startAt: input.startAt,
    endAt: input.endAt,
    placeLabel: input.placeLabel,

    // ✅ NEW
    emoji: input.emoji ?? null,
  });
}

export async function joinEvent(eventId: string): Promise<void> {
  await apiJoin(eventId);
}

export async function leaveEvent(eventId: string): Promise<void> {
  await apiLeave(eventId);
}

export async function checkIn(eventId: string): Promise<void> {
  await apiCheckIn(eventId);
}

export async function checkout(eventId: string): Promise<void> {
  await apiCheckout(eventId);
}

export async function getCurrentHereEvent(userId: string): Promise<Event | null> {
  const events = await listEvents();
  return events.find((e) => e.hereIds?.includes(userId)) ?? null;
}

export async function poke(
  eventId: string,
  _fromUserId: string,
  toUserId: string,
  message: string
): Promise<void> {
  const clean = String(message ?? "").trim();
  if (!clean) throw new Error("EMPTY_POKE_MESSAGE");
  if (clean.length > 80) throw new Error("POKE_MESSAGE_TOO_LONG");

  await apiPokeEvent(eventId, { toUserId, message: clean });
}