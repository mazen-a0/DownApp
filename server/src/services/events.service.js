const Group = require("../models/Group");
const Event = require("../models/Event");
const User = require("../models/User");

const { notifyUser, notifyGroup, notifyEventParticipants } = require('./notificationHelpers');

function asStr(x) {
  return String(x);
}

async function assertMember(userId, groupId) {
  const group = await Group.findById(groupId);
  if (!group) {
    const err = new Error("GROUP_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  const ok = group.memberIds.map(asStr).includes(asStr(userId));
  if (!ok) {
    const err = new Error("NOT_A_GROUP_MEMBER");
    err.status = 403;
    throw err;
  }

  return group;
}

async function listEvents({ userId, groupId, from, to }) {
  if (!groupId) {
    const err = new Error("groupId is required");
    err.status = 400;
    throw err;
  }

  await assertMember(userId, groupId);

  const query = { groupId };

  // date range (matches Mazen’s Calendar)
  if (from || to) {
    query.startAt = {};
    if (from) query.startAt.$gte = new Date(from);
    if (to) query.startAt.$lte = new Date(to);
  }

  const events = await Event.find(query).sort({ startAt: 1 }).limit(200);

  // Match Mazen’s frontend shape
  return events.map((e) => ({
    eventId: e._id,
    groupId: e.groupId,
    title: e.title,
    tag: e.tag,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    placeLabel: e.placeLabel || null,
    participantIds: e.participantIds.map(asStr),
    hereIds: e.hereIds.map(asStr),
    emoji: e.emoji || null,

  }));
}

async function createEvent({ userId, payload }) {
  const { groupId, title, tag, startAt, endAt, placeLabel, emoji } = payload;

  if (!groupId || !title || !tag || !startAt || !endAt) {
    const err = new Error("MISSING_FIELDS");
    err.status = 400;
    throw err;
  }

  await assertMember(userId, groupId);

  const event = await Event.create({
    groupId,
    creatorId: userId, // matches your schema (creatorId)
    title: String(title).trim(),
    tag: String(tag).trim(),
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    placeLabel: placeLabel ? String(placeLabel).trim() : null,
    emoji: emoji ? String(emoji).trim() : null,
    participantIds: [userId], // creator is automatically “down”
    hereIds: [],
  });

  try {
    const creator = await User.findById(userId).select('name');
    const startTime = new Date(startAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    // NEW EVENT NOTIFICATION: notify all group members about the new event
    await notifyGroup(
      groupId,
      userId,
      `${creator.name} created an event`,
      `${title} at ${startTime}`,
      {
        type: 'new_event',
        eventId: event._id.toString(),
        groupId: groupId.toString()
      }
    );
  } catch (notifError) {
    console.error('Failed to send new event notification:', notifError);
    // Don't fail the request if notification fails
  }

  return event;
}

async function joinEvent({ userId, eventId }) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error("EVENT_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  await assertMember(userId, event.groupId);

  await Event.updateOne(
    { _id: eventId },
    { $addToSet: { participantIds: userId } }
  );

  // NEW JOIN NOTIFICATION: notify existing event participants that someone new joined
  try {
    const user = await User.findById(userId).select('name');
    
    await notifyEventParticipants(
      event,
      userId,
      `${user.name} is down!`,
      `for ${event.title}`,
      {
        type: 'join_event',
        eventId: eventId.toString(),
        userId: userId.toString()
      }
    );
  } catch (notifError) {
    console.error('Failed to send join event notification:', notifError);
  }
}

async function leaveEvent({ userId, eventId }) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error("EVENT_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  await assertMember(userId, event.groupId);

  await Event.updateOne(
    { _id: eventId },
    { $pull: { participantIds: userId, hereIds: userId } }
  );
}

async function checkInEvent({ userId, eventId }) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error("EVENT_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  await assertMember(userId, event.groupId);

  // must have joined first (MVP rule)
  const joined = event.participantIds.map(asStr).includes(asStr(userId));
  if (!joined) {
    const err = new Error("MUST_JOIN_BEFORE_CHECKIN");
    err.status = 400;
    throw err;
  }

  // exclusivity: remove from all other events in same group
  await Event.updateMany(
    { groupId: event.groupId },
    { $pull: { hereIds: userId } }
  );

  // add to this event
  await Event.updateOne(
    { _id: eventId },
    { $addToSet: { hereIds: userId } }
  );

  // NEW CHECK-IN NOTIFICATION: notify event participants that someone checked in
  try {
    const user = await User.findById(userId).select('name');
    
    await notifyEventParticipants(
      event,
      userId,
      `${user.name} is here!`,
      event.placeLabel || event.title,
      {
        type: 'check_in',
        eventId: eventId.toString(),
        userId: userId.toString(),
        place: event.placeLabel || null
      }
    );
  } catch (notifError) {
    console.error('Failed to send check-in notification:', notifError);
  }
}

async function checkOutEvent({ userId, eventId }) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error("EVENT_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  await assertMember(userId, event.groupId);

  await Event.updateOne({ _id: eventId }, { $pull: { hereIds: userId } });
}

const Poke = require("../models/Poke");

const POKE_MAX_CHARS = 80;

async function createPoke({ fromUserId, toUserId, eventId, message }) {
  console.log("[POKE] createPoke called", {
    fromUserId: String(fromUserId),
    toUserId: String(toUserId),
    eventId: String(eventId),
    rawMessageLen: String(message ?? "").length,
  });

  const clean = String(message ?? "").trim();
  console.log("[POKE] cleaned message", { cleanLen: clean.length, clean });

  if (!toUserId || !clean) {
    console.log("[POKE] missing fields", { toUserId, clean });
    const err = new Error("MISSING_FIELDS");
    err.status = 400;
    throw err;
  }

  if (clean.length > POKE_MAX_CHARS) {
    console.log("[POKE] too long", { cleanLen: clean.length, max: POKE_MAX_CHARS });
    const err = new Error("POKE_MESSAGE_TOO_LONG");
    err.status = 400;
    throw err;
  }

  const event = await Event.findById(eventId).select("_id groupId title placeLabel participantIds");
  console.log("[POKE] event lookup", { found: !!event, eventGroupId: event ? String(event.groupId) : null });

  if (!event) {
    const err = new Error("EVENT_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  await assertMember(fromUserId, event.groupId);
  console.log("[POKE] assertMember ok");

  const pokeDoc = await Poke.create({
    eventId,
    groupId: event.groupId,
    fromUserId,
    toUserId,
    message: clean,
    createdAt: new Date(),
  });
  console.log("[POKE] poke saved", { pokeId: String(pokeDoc._id) });

  // 🔥 IMPORTANT: fetch both users to see if tokens exist
  const [fromUser, toUser] = await Promise.all([
    User.findById(fromUserId).select("name pushToken"),
    User.findById(toUserId).select("name pushToken"),
  ]);

  console.log("[POKE] users", {
    fromName: fromUser?.name,
    toName: toUser?.name,
    fromTokenPrefix: fromUser?.pushToken ? fromUser.pushToken.slice(0, 20) : null,
    toTokenPrefix: toUser?.pushToken ? toUser.pushToken.slice(0, 20) : null,
    toHasToken: !!toUser?.pushToken,
  });

  try {
    console.log("[POKE] notifying user…", { toUserId: String(toUserId) });

    const result = await notifyUser(
      toUserId,
      `${fromUser?.name ?? "Someone"} poked you!`,
      clean,
      {
        type: "poke",
        eventId: String(eventId),
        fromUserId: String(fromUserId),
        toUserId: String(toUserId),
      }
    );

    console.log("[POKE] notifyUser result:", result);
  } catch (notifError) {
    console.error("[POKE] notifyUser threw:", notifError);
  }
}




module.exports = {
  listEvents,
  createEvent,
  joinEvent,
  leaveEvent,
  checkInEvent,
  checkOutEvent,
  createPoke,
};