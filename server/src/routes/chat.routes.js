// define 1) get chat general 2) get chat events feed 3) get chat events eventid 4) post chat messages

const express = require("express");
const {
  getGeneral,
  getEventsFeed,
  getEventThread,
  postMessage,
} = require("../controllers/chat.controller");

const router = express.Router();

// GET /chat/general?groupId=...
router.get("/general", getGeneral);

// GET /chat/events/feed?groupId=...
router.get("/events/feed", getEventsFeed);

// GET /chat/events/:eventId
router.get("/events/:eventId", getEventThread);

// POST /chat/messages
router.post("/messages", postMessage);

module.exports = router;