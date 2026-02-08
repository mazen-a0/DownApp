const eventsService = require("../services/events.service");

// GET /events?groupId&from&to
async function listEvents(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, from, to } = req.query;

    const events = await eventsService.listEvents({ userId, groupId, from, to });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

// POST /events
async function createEvent(req, res, next) {
  try {
    const userId = req.userId;

    const event = await eventsService.createEvent({ userId, payload: req.body });
    res.status(201).json({ eventId: event._id });
  } catch (err) {
    next(err);
  }
}

// POST /events/:eventId/join
async function joinEvent(req, res, next) {
  try {
    const userId = req.userId;
    const { eventId } = req.params;

    await eventsService.joinEvent({ userId, eventId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /events/:eventId/leave
async function leaveEvent(req, res, next) {
  try {
    const userId = req.userId;
    const { eventId } = req.params;

    await eventsService.leaveEvent({ userId, eventId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /events/:eventId/checkin
async function checkInEvent(req, res, next) {
  try {
    const userId = req.userId;
    const { eventId } = req.params;

    await eventsService.checkInEvent({ userId, eventId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /events/:eventId/checkout
async function checkOutEvent(req, res, next) {
  try {
    const userId = req.userId;
    const { eventId } = req.params;

    await eventsService.checkOutEvent({ userId, eventId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEvents,
  createEvent,
  joinEvent,
  leaveEvent,
  checkInEvent,
  checkOutEvent,
};