const Group = require("../models/Group");
const Event = require("../models/Event");
const Message = require("../models/Message");

function httpError(status, error, message) {
  const err = new Error(message || error);
  err.status = status;
  err.error = error; // your error middleware can use this
  return err;
}

function parseLimit(raw, def = 200, max = 500) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
}

function toDto(doc) {
  return {
    messageId: doc._id,
    groupId: doc.groupId,
    eventId: doc.eventId ?? null,
    fromUserId: doc.fromUserId,
    text: doc.text,
    createdAt: doc.createdAt.toISOString(),
  };
}

// Ensure userId is a member of groupId
async function assertMember(userId, groupId) {
  if (!groupId) throw httpError(400, "MISSING_GROUP_ID", "Missing groupId");

  const group = await Group.findById(groupId);
  if (!group) throw httpError(404, "GROUP_NOT_FOUND", "Group not found");

  const isMember = group.memberIds.some((id) => String(id) === String(userId));
  if (!isMember) throw httpError(403, "NOT_IN_GROUP", "User not in group");

  return group;
}

/**
 * GET /chat/general?groupId=...&limit=&before=
 * Returns Message[] (eventId null)
 */
async function listGeneralMessages({ userId, groupId, limit, before, since }) {
  await assertMember(userId, groupId);

  const query = { groupId, eventId: null };

  // ✅ NEW: live updates
  if (since) {
    const d = new Date(since);
    if (!Number.isFinite(d.getTime())) throw httpError(400, "BAD_SINCE", "Invalid since date");
    query.createdAt = { $gt: d };
  }

  // Existing pagination
  if (before) {
    const d = new Date(before);
    if (!Number.isFinite(d.getTime())) throw httpError(400, "BAD_BEFORE", "Invalid before date");
    query.createdAt = { ...(query.createdAt || {}), $lt: d };
  }

  const lim = parseLimit(limit, 200, 500);

  const docs = await Message.find(query).sort({ createdAt: 1 }).limit(lim);
  return docs.map(toDto);
}

/**
 * GET /chat/events/feed?groupId=...&limit=&since=
 * Returns Message[] (eventId non-null)
 */
async function listEventsFeed({ userId, groupId, limit, since }) {
  await assertMember(userId, groupId);

  const query = { groupId, eventId: { $ne: null } };

  if (since) {
    const d = new Date(since);
    if (!Number.isFinite(d.getTime())) throw httpError(400, "BAD_SINCE", "Invalid since date");
    query.createdAt = { $gte: d };
  }

  const lim = parseLimit(limit, 500, 1500);

  const docs = await Message.find(query).sort({ createdAt: 1 }).limit(lim);

  return docs.map(toDto);
}

/**
 * GET /chat/events/:eventId?limit=&before=
 * Returns Message[] for one event thread
 */
async function listEventMessages({ userId, eventId, limit, before }) {
  if (!eventId) throw httpError(400, "MISSING_EVENT_ID", "Missing eventId");

  const event = await Event.findById(eventId);
  if (!event) throw httpError(404, "EVENT_NOT_FOUND", "Event not found");

  // membership is checked against the event's group
  await assertMember(userId, event.groupId);

  const query = { groupId: event.groupId, eventId };

  if (before) {
    const d = new Date(before);
    if (!Number.isFinite(d.getTime())) throw httpError(400, "BAD_BEFORE", "Invalid before date");
    query.createdAt = { $lt: d };
  }

  const lim = parseLimit(limit, 200, 500);

  const docs = await Message.find(query).sort({ createdAt: 1 }).limit(lim);

  return docs.map(toDto);
}

/**
 * POST /chat/messages
 * Body { groupId, eventId|null, text }
 * Returns a single Message object
 */
async function sendMessage({ userId, groupId, eventId, text }) {
  await assertMember(userId, groupId);

  const clean = String(text ?? "").trim();
  if (!clean) throw httpError(400, "EMPTY_MESSAGE", "Message text is empty");

  // If eventId provided, validate event exists + is in the same group
  let finalEventId = null;

  if (eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw httpError(404, "EVENT_NOT_FOUND", "Event not found");

    if (String(event.groupId) !== String(groupId)) {
      throw httpError(403, "EVENT_NOT_IN_GROUP", "Event not in this group");
    }

    finalEventId = eventId;
  }

  const doc = await Message.create({
    groupId,
    eventId: finalEventId, // null for general
    fromUserId: userId,
    text: clean,
    createdAt: new Date(),
  });

  return toDto(doc);
}

module.exports = {
  listGeneralMessages,
  listEventsFeed,
  listEventMessages,
  sendMessage,
};