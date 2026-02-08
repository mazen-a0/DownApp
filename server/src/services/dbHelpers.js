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
  createPoke
};