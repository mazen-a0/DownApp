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
} from "../api/eventsApi";

// Helper: list today's events for current group
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

// Optional helper (no backend endpoint needed):
// Find which event the user is currently "Here" in, by scanning today's events.
export async function getCurrentHereEvent(userId: string): Promise<Event | null> {
  const events = await listEvents();
  return events.find((e) => e.hereIds?.includes(userId)) ?? null;
}

// If pokes aren't implemented yet, don't break UI:
export async function poke(
  _eventId: string,
  _fromUserId: string,
  _toUserId: string,
  _message: string
): Promise<void> {
  // TODO: hook to POST /pokes when backend implements it
  return;
}