import { api } from "./client";
import type { Event } from "../repositories/types";

export type FetchEventsParams = {
  groupId: string;
  from: string; // ISO
  to: string; // ISO
};

function logApiError(prefix: string, e: any) {
  // axios-style errors
  const status = e?.response?.status;
  const data = e?.response?.data;
  const url = e?.config?.url;
  const method = e?.config?.method;
  const reqData = e?.config?.data;

  console.log(`[${prefix}] ERROR`, {
    status,
    url,
    method,
    data,
    reqData,
    message: e?.message,
  });
}

export async function fetchEvents(params: FetchEventsParams): Promise<Event[]> {
  console.log("[eventsApi] fetchEvents -> GET /events params=", params);

  try {
    const res = await api.get("/events", { params });
    console.log("[eventsApi] fetchEvents <-", res.status, res.data);

    const data = res.data;
    if (Array.isArray(data)) return data as Event[];
    return (data.events ?? []) as Event[];
  } catch (e: any) {
    logApiError("eventsApi fetchEvents", e);
    throw e;
  }
}

export async function createEvent(body: {
  groupId: string;
  title: string;
  tag: string;
  startAt: string;
  endAt: string;
  placeLabel?: string;
  emoji?: string | null;
}): Promise<Event> {
  console.log("[eventsApi] createEvent -> POST /events body=", body);

  try {
    const res = await api.post("/events", body);
    console.log("[eventsApi] createEvent <-", res.status, res.data);
    return res.data as Event;
  } catch (e: any) {
    logApiError("eventsApi createEvent", e);
    throw e;
  }
}

export async function joinEvent(eventId: string) {
  console.log("[eventsApi] joinEvent -> POST", `/events/${eventId}/join`);

  try {
    const res = await api.post(`/events/${eventId}/join`);
    console.log("[eventsApi] joinEvent <-", res.status, res.data);
    return res.data;
  } catch (e: any) {
    logApiError("eventsApi joinEvent", e);
    throw e;
  }
}

export async function leaveEvent(eventId: string) {
  console.log("[eventsApi] leaveEvent -> POST", `/events/${eventId}/leave`);

  try {
    const res = await api.post(`/events/${eventId}/leave`);
    console.log("[eventsApi] leaveEvent <-", res.status, res.data);
    return res.data;
  } catch (e: any) {
    logApiError("eventsApi leaveEvent", e);
    throw e;
  }
}

export async function checkIn(eventId: string) {
  console.log("[eventsApi] checkIn -> POST", `/events/${eventId}/checkin`, { status: "here" });

  try {
    const res = await api.post(`/events/${eventId}/checkin`, { status: "here" });
    console.log("[eventsApi] checkIn <-", res.status, res.data);
    return res.data;
  } catch (e: any) {
    logApiError("eventsApi checkIn", e);
    throw e;
  }
}

export async function checkout(eventId: string) {
  console.log("[eventsApi] checkout -> POST", `/events/${eventId}/checkout`);

  try {
    const res = await api.post(`/events/${eventId}/checkout`);
    console.log("[eventsApi] checkout <-", res.status, res.data);
    return res.data;
  } catch (e: any) {
    logApiError("eventsApi checkout", e);
    throw e;
  }
}

export async function pokeEvent(eventId: string, body: { toUserId: string; message: string }) {
  // IMPORTANT: this is the exact route your Express router uses:
  // router.post('/:eventId/pokes', createPoke);
  const url = `/events/${eventId}/pokes`;

  console.log("[eventsApi] pokeEvent -> POST", url, "body=", body);

  try {
    const res = await api.post(url, body);
    console.log("[eventsApi] pokeEvent <-", res.status, res.data);
    return res.data;
  } catch (e: any) {
    logApiError("eventsApi pokeEvent", e);
    throw e;
  }
}