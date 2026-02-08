const chatService = require("../services/chat.service");

// GET /chat/general?groupId=...&limit=&before=
async function getGeneral(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, limit, before } = req.query;

    const messages = await chatService.listGeneralMessages({
      userId,
      groupId,
      limit,
      before,
    });

    // Must be a raw array
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// GET /chat/events/feed?groupId=...&limit=&since=
async function getEventsFeed(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, limit, since } = req.query;

    const messages = await chatService.listEventsFeed({
      userId,
      groupId,
      limit,
      since,
    });

    // Must be a raw array
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// GET /chat/events/:eventId?limit=&before=
async function getEventThread(req, res, next) {
  try {
    const userId = req.userId;
    const { eventId } = req.params;
    const { limit, before } = req.query;

    const messages = await chatService.listEventMessages({
      userId,
      eventId,
      limit,
      before,
    });

    // Must be a raw array
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// POST /chat/messages  { groupId, eventId|null, text }
async function postMessage(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, eventId, text } = req.body;

    const message = await chatService.sendMessage({
      userId,
      groupId,
      eventId,
      text,
    });

    // Must be the single message object
    res.json(message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getGeneral,
  getEventsFeed,
  getEventThread,
  postMessage,
};