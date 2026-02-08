const { upsertUser, lookupUsersByIds } = require("../services/users.service");
const Event = require("../models/Event");

async function createUser(req, res, next) {
  try {
    const { name, deviceId, pushToken } = req.body;

    const user = await upsertUser({ name, deviceId, pushToken });

    res.status(200).json({
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyHere(req, res, next) {
  try {
    const userId = req.userId;

    const event = await Event.findOne({ hereIds: userId }).sort({ startAt: -1 });

    if (!event) {
      return res.json({ event: null });
    }

    res.json({
      event: {
        eventId: event._id,
        groupId: event.groupId,
        title: event.title,
        tag: event.tag,
        placeLabel: event.placeLabel || null,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ✅ NEW: POST /users/lookup  body: { ids: string[] }
// returns: { users: { [id]: name } }
async function lookupUsers(req, res, next) {
  try {
    const { ids } = req.body;
    const users = await lookupUsersByIds(ids || []);
    return res.json({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, getMyHere, lookupUsers };