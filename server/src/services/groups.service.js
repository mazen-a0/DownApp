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
  await User.updateOne({ _id: userId }, { $addToSet: { groupIds: group._id } });

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

  await Group.updateOne({ _id: group._id }, { $addToSet: { memberIds: userId } });
  await User.updateOne({ _id: userId }, { $addToSet: { groupIds: group._id } });

  return group;
}

// MVP assumption: "current" group = first one in user.groupIds
async function getMyGroup({ userId }) {
  const user = await User.findById(userId);
  if (!user || !Array.isArray(user.groupIds) || user.groupIds.length === 0) return null;

  const groupId = user.groupIds[0];
  return await Group.findById(groupId);
}

// return ALL groups user is in
async function getMyGroups({ userId }) {
  const user = await User.findById(userId);
  if (!user || !Array.isArray(user.groupIds) || user.groupIds.length === 0) return [];

  const groups = await Group.find({ _id: { $in: user.groupIds } });

  // keep same order as user.groupIds
  const index = new Map(user.groupIds.map((id, i) => [String(id), i]));
  groups.sort((a, b) => (index.get(String(a._id)) ?? 0) - (index.get(String(b._id)) ?? 0));

  return groups;
}

async function fetchGroup({ groupId, userId }) {
  const group = await Group.findById(groupId);
  if (!group) {
    const err = new Error("GROUP_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  const isMember = (group.memberIds || []).some((id) => String(id) === String(userId));
  if (!isMember) {
    const err = new Error("NOT_A_MEMBER");
    err.status = 403;
    throw err;
  }

  return group;
}

async function updateGroupName({ groupId, userId, name }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    const err = new Error("NAME_REQUIRED");
    err.status = 400;
    throw err;
  }

  await fetchGroup({ groupId, userId });
  await Group.updateOne({ _id: groupId }, { $set: { name: name.trim() } });

  return await Group.findById(groupId);
}

module.exports = {
  createGroup,
  joinGroup,
  getMyGroup,
  getMyGroups,
  fetchGroup,
  updateGroupName,
};