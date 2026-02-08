const User = require('../models/User');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Poke = require('../models/Poke');

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createGroup(name, creatorId) {
  const inviteCode = generateInviteCode();
  const group = new Group({
    name,
    inviteCode,
    memberIds: [creatorId]
  });
  await group.save();
  
  await User.findByIdAndUpdate(creatorId, {
    $push: { groupIds: group._id }
  });
  
  return group;
}

async function joinGroup(inviteCode, userId) {
  const group = await Group.findOne({ inviteCode });
  if (!group) throw new Error('Group not found');
  
  await Group.findByIdAndUpdate(group._id, {
    $addToSet: { memberIds: userId }
  });
  
  await User.findByIdAndUpdate(userId, {
    $addToSet: { groupIds: group._id }
  });
  
  return group;
}

async function createEvent(eventData) {
  const event = new Event(eventData);
  await event.save();
  return event;
}

async function joinEvent(eventId, userId) {
  return await Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { participantIds: userId } },
    { new: true }
  );
}

async function leaveEvent(eventId, userId) {
  return await Event.findByIdAndUpdate(
    eventId,
    { 
      $pull: { 
        participantIds: userId,
        hereIds: userId
      } 
    },
    { new: true }
  );
}

async function checkIn(eventId, userId) {
  return await Event.findByIdAndUpdate(
    eventId,
    { 
      $addToSet: { 
        participantIds: userId,
        hereIds: userId 
      } 
    },
    { new: true }
  );
}

async function checkOut(eventId, userId) {
  return await Event.findByIdAndUpdate(
    eventId,
    { $pull: { hereIds: userId } },
    { new: true }
  );
}

async function getEventsInRange(groupId, fromDate, toDate) {
  return await Event.find({
    groupId,
    startAt: { $gte: fromDate },
    endAt: { $lte: toDate }
  }).populate('creatorId participantIds hereIds', 'name').sort({ startAt: 1 });
}

async function getGroupWithMembers(groupId) {
  return await Group.findById(groupId)
    .populate('memberIds', 'name')
    .lean();
}

async function createPoke(pokeData) {
  const poke = new Poke(pokeData);
  await poke.save();
  return poke;
}

const Message = require('../models/Message');

// List general group messages (eventId = null)
async function listGeneralMessages({ groupId, limit = 200, before = null }) {
  const query = { 
    groupId, 
    eventId: null 
  };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  return await Message.find(query)
    .sort({ createdAt: 1 }) // ascending (oldest first)
    .limit(limit)
    .lean();
}

// List all event messages for a group (for thread previews)
async function listEventsFeed({ groupId, limit = 500, since = null }) {
  const query = { 
    groupId,
    eventId: { $ne: null } // not null = event messages only
  };
  
  if (since) {
    query.createdAt = { $gte: new Date(since) };
  }
  
  return await Message.find(query)
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

// List messages for a specific event
async function listEventMessages({ eventId, limit = 200, before = null }) {
  const query = { eventId };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  return await Message.find(query)
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

// Send a message (general or event)
async function sendMessage({ groupId, eventId = null, userId, text }) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('EMPTY_MESSAGE');
  }
  
  const message = new Message({
    groupId,
    eventId: eventId || null,
    fromUserId: userId,
    text: trimmed
  });
  
  await message.save();
  return message.toObject();
}

// Export these
module.exports = {
  createGroup,
  joinGroup,
  createEvent,
  joinEvent,
  leaveEvent,
  checkIn,
  checkOut,
  getEventsInRange,
  getGroupWithMembers,
  createPoke,
  listGeneralMessages,
  listEventsFeed,
  listEventMessages,
  sendMessage
};