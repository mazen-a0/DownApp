import { Event, CreateEventInput } from "./types";
import { loadSession } from "../state/session";

let EVENTS: Event[] = [
  {
    eventId: "e1",
    title: "Study sesh @ McLennan",
    tag: "library",
    startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    placeLabel: "McLennan Library",
    participantIds: ["u1", "u2", "u3"],
    hereIds: ["u2"],
  },
  {
    eventId: "e2",
    title: "Late night poutine run",
    tag: "food",
    startAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    placeLabel: "La Banquise",
    participantIds: ["u1", "u3"],
    hereIds: [],
  },
];

async function resolveUserId(userId?: string): Promise<string> {
  if (userId) return userId;
  const s = await loadSession();
  if (!s.userId) throw new Error("No userId in session (demoRepo).");
  return s.userId;
}

function genId(prefix: string) {
  return `${prefix}${Math.floor(Math.random() * 1000000)}`;
}

export async function listEvents(): Promise<Event[]> {
  return EVENTS;
}

// userId is optional now (it will pull from session if omitted)
export async function createEvent(input: CreateEventInput, userId?: string): Promise<Event> {
  const uid = await resolveUserId(userId);

  const event: Event = {
    eventId: genId("e"),
    title: input.title,
    tag: input.tag,
    startAt: input.startAt,
    endAt: input.endAt,
    placeLabel: input.placeLabel,
    participantIds: [uid],
    hereIds: [],
  };

  EVENTS = [event, ...EVENTS];
  return event;
}

export async function joinEvent(eventId: string, userId?: string) {
  const uid = await resolveUserId(userId);

  EVENTS = EVENTS.map((e) =>
    e.eventId === eventId && !e.participantIds.includes(uid)
      ? { ...e, participantIds: [...e.participantIds, uid] }
      : e
  );
}

export async function leaveEvent(eventId: string, userId?: string) {
  const uid = await resolveUserId(userId);

  EVENTS = EVENTS.map((e) =>
    e.eventId === eventId
      ? {
          ...e,
          participantIds: e.participantIds.filter((id) => id !== uid),
          hereIds: e.hereIds.filter((id) => id !== uid),
        }
      : e
  );
}

/**
 * Returns the event where this user is currently checked in ("here"), if any.
 * (In demo mode, we enforce only one at a time.)
 */
export async function getCurrentHereEvent(userId?: string): Promise<Event | null> {
  const uid = await resolveUserId(userId);
  const found = EVENTS.find((e) => e.hereIds.includes(uid));
  return found || null;
}

/**
 * Check in:
 * - Ensures user is in participantIds
 * - Ensures user is only "here" in ONE event by removing from all other hereIds
 */
export async function checkIn(eventId: string, userId?: string) {
  const uid = await resolveUserId(userId);

  // remove user from "here" everywhere first
  EVENTS = EVENTS.map((e) => ({
    ...e,
    hereIds: e.hereIds.filter((id) => id !== uid),
  }));

  EVENTS = EVENTS.map((e) => {
    if (e.eventId !== eventId) return e;

    const participantIds = e.participantIds.includes(uid) ? e.participantIds : [...e.participantIds, uid];
    const hereIds = e.hereIds.includes(uid) ? e.hereIds : [...e.hereIds, uid];

    return { ...e, participantIds, hereIds };
  });
}

/**
 * Check out of one event (removes from hereIds only)
 */
export async function checkout(eventId: string, userId?: string) {
  const uid = await resolveUserId(userId);

  EVENTS = EVENTS.map((e) =>
    e.eventId === eventId ? { ...e, hereIds: e.hereIds.filter((id) => id !== uid) } : e
  );
}

export async function poke(
  eventId: string,
  fromUserId: string,
  toUserId: string,
  message: string
) {
  console.log(`POKE: ${fromUserId} → ${toUserId} in ${eventId}: ${message}`);
}