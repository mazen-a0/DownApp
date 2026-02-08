const Group = require("../models/Group");
const User = require("../models/User");

function randomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function createGroup({ name, userId }) {
  if (!name || typeof name !== "string") {
    const err = new Error("Group name is required");
    err.status = 400;
    throw err;
  }

  // generate unique-ish invite code (good enough for MVP)
  let inviteCode = randomCode();
  for (let tries = 0; tries < 5; tries++) {
    const exists = await Group.findOne({ inviteCode });
    if (!exists) break;
    inviteCode = randomCode();
  }

  const group = await Group.create({
    name: name.trim(),
    inviteCode,
    memberIds: [userId],
  });

  // also update user
  await User.updateOne(
    { _id: userId },
    { $addToSet: { groupIds: group._id } }
  );

  return group;
}

async function joinGroup({ inviteCode, userId }) {
  if (!inviteCode) {
    const err = new Error("inviteCode is required");
    err.status = 400;
    throw err;
  }

  const group = await Group.findOne({ inviteCode });
  if (!group) {
    const err = new Error("INVALID_INVITE_CODE");
    err.status = 404;
    throw err;
  }

  await Group.updateOne(
    { _id: group._id },
    { $addToSet: { memberIds: userId } }
  );

  await User.updateOne(
    { _id: userId },
    { $addToSet: { groupIds: group._id } }
  );

  return group;
}

module.exports = { createGroup, joinGroup };