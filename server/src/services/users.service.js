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

module.exports = { upsertUser };
