export type Message = {
  messageId: string;
  groupId: string; // keep it for later API parity, but DEMO ignores it when reading
  eventId?: string | null; // null = general chat
  fromUserId: string;
  text: string;
  createdAt: string; // ISO
};

let MESSAGES: Message[] = [
  // General chat
  {
    messageId: "m0",
    groupId: "g1",
    eventId: null,
    fromUserId: "u1",
    text: "Who’s down to do something later?",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    messageId: "m00",
    groupId: "g1",
    eventId: null,
    fromUserId: "u2",
    text: "If it involves food, yes.",
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },

  // Event chats
  {
    messageId: "m1",
    groupId: "g1",
    eventId: "e1",
    fromUserId: "u2",
    text: "I’m here — second floor 📚",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    messageId: "m2",
    groupId: "g1",
    eventId: "e1",
    fromUserId: "u1",
    text: "Anyone want coffee before we lock in?",
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  {
    messageId: "m3",
    groupId: "g1",
    eventId: "e2",
    fromUserId: "u3",
    text: "Poutine after midterms is mandatory",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
];

function mkId(prefix: string) {
  return prefix + Math.floor(Math.random() * 1000000000).toString();
}

function sortNewestFirst(a: Message, b: Message) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortOldestFirst(a: Message, b: Message) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

/**
 * DEMO MODE RULE:
 * We IGNORE groupId for reads, so your chat always shows while you're still building.
 * When backend is live, we will filter by groupId again.
 */
export async function listGeneralMessages(_groupId: string): Promise<Message[]> {
  return MESSAGES
    .filter((m) => m.eventId === null || m.eventId === undefined)
    .sort(sortOldestFirst);
}

export async function listEventMessages(_groupId: string, eventId: string): Promise<Message[]> {
  return MESSAGES.filter((m) => m.eventId === eventId).sort(sortOldestFirst);
}

export async function listEventsFeed(_groupId: string): Promise<Message[]> {
  return MESSAGES.filter((m) => m.eventId).sort(sortNewestFirst);
}

export async function sendMessage(params: {
  groupId: string;
  eventId?: string | null;
  fromUserId: string;
  text: string;
}): Promise<Message> {
  const msg: Message = {
    messageId: mkId("m"),
    groupId: params.groupId,
    eventId: params.eventId ?? null,
    fromUserId: params.fromUserId,
    text: params.text.trim(),
    createdAt: new Date().toISOString(),
  };

  MESSAGES = [...MESSAGES, msg]; // append so "chat order" feels natural
  return msg;
}