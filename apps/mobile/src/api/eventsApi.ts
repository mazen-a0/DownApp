import { api } from "./client";
import type { Event } from "../repositories/types";

export type FetchEventsParams = {
  groupId: string;
  from: string; // ISO
  to: string;   // ISO
};

export async function fetchEvents(params: FetchEventsParams): Promise<Event[]> {
  const res = await api.get("/events", { params });
  const data = res.data;
  if (Array.isArray(data)) return data as Event[];
  return (data.events ?? []) as Event[];
}

export async function createEvent(body: {
  groupId: string;
  title: string;
  tag: string;
  startAt: string;
  endAt: string;
  placeLabel?: string;

  // ✅ NEW
  emoji?: string | null;
}): Promise<Event> {
  const res = await api.post("/events", body);
  return res.data as Event;
}

export async function joinEvent(eventId: string) {
  const res = await api.post(`/events/${eventId}/join`);
  return res.data;
}

export async function leaveEvent(eventId: string) {
  const res = await api.post(`/events/${eventId}/leave`);
  return res.data;
}

export async function checkIn(eventId: string) {
  const res = await api.post(`/events/${eventId}/checkin`, { status: "here" });
  return res.data;
}

export async function checkout(eventId: string) {
  const res = await api.post(`/events/${eventId}/checkout`);
  return res.data;
}