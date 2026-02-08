const mongoose = require("mongoose");
const User = require("../models/User");

async function upsertUser({ name, deviceId, pushToken }) {
  if (!deviceId || typeof deviceId !== "string") {
    const err = new Error("deviceId is required");
    err.status = 400;
    throw err;
  }

  const update = {};
  if (name && typeof name === "string") update.name = name.trim();
  if (pushToken !== undefined) update.pushToken = pushToken;

  const user = await User.findOneAndUpdate(
    { deviceId },
    { $set: update, $setOnInsert: { groupIds: [] } },
    { new: true, upsert: true }
  );

  return user;
}

// ✅ NEW
async function lookupUsersByIds(ids) {
  const unique = Array.from(new Set((ids || []).filter(Boolean)));

  // filter only valid ObjectIds (otherwise Mongoose CastError)
  const valid = unique.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (valid.length === 0) return {};

  const users = await User.find({ _id: { $in: valid } }).select("_id name").lean();

  const map = {};
  for (const u of users) map[String(u._id)] = u.name;

  return map;
}

module.exports = { upsertUser, lookupUsersByIds };