import dayjs from "dayjs";
import { loadSession } from "../state/session";
import { fetchEvents } from "../api/eventsApi";
import type { Event } from "./types";

// API-backed implementation that matches your existing Event type
export async function listEvents(): Promise<Event[]> {
  const session = await loadSession();
  if (!session.groupId) return [];

  // Today range (00:00 -> tomorrow 00:00) local time
  const from = dayjs().startOf("day").toISOString();
  const to = dayjs().add(1, "day").startOf("day").toISOString();

  const events = await fetchEvents({ groupId: session.groupId, from, to });

  // Backend returns ISO strings already; this should match your Event type
  return events as Event[];
}