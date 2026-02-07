export type EventTag =
  | "study"
  | "library"
  | "bar"
  | "club"
  | "stay_in"
  | "food"
  | "gym"
  | "other";

export type Event = {
  eventId: string;
  title: string;
  tag: EventTag;
  startAt: string; // ISO
  endAt: string;   // ISO
  placeLabel?: string;
  participantIds: string[];
  hereIds: string[];
};

export const demoEvents: Event[] = [
  {
    eventId: "e1",
    title: "Down to study",
    tag: "study",
    startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    placeLabel: "McLennan Library",
    participantIds: ["u1", "u2"],
    hereIds: ["u2"],
  },
  {
    eventId: "e2",
    title: "Coffee + catchup",
    tag: "food",
    startAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    placeLabel: "Milton B Café",
    participantIds: ["u1"],
    hereIds: [],
  },
];