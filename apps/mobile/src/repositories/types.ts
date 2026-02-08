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
  startAt: string;
  endAt: string;
  placeLabel?: string;
  participantIds: string[];
  hereIds: string[];
};

export type CreateEventInput = {
  title: string;
  tag: EventTag;
  startAt: string;
  endAt: string;
  placeLabel?: string;
};