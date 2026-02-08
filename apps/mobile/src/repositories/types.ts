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
  placeLabel?: string | null;
  participantIds: string[];
  hereIds: string[];

  // ✅ NEW
  emoji?: string | null;
};

export type CreateEventInput = {
  title: string;
  tag: EventTag;
  startAt: string;
  endAt: string;
  placeLabel?: string;

  // ✅ NEW
  emoji?: string | null;
};

export type Message = {
  messageId: string;
  groupId: string;
  eventId?: string | null;
  fromUserId: string;
  text: string;
  createdAt: string; // ISO
};