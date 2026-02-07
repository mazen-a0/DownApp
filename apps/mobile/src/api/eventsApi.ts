import { api } from "./client";

export async function fetchEvents(params: {
  groupId: string;
  from: string;
  to: string;
}) {
  const res = await api.get<{ events: any[] }>("/events", { params });
  return res.data.events;
}