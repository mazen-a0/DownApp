const express = require("express");
const { createUser, getMyHere } = require("../controllers/users.controller");
const requireUser = require("../middleware/requireUser");

const router = express.Router();

// Public: bootstrap/upsert user by deviceId
router.post("/", createUser);
router.post("/upsert", createUser);

// Protected: requires x-user-id
router.get("/me/here", requireUser, getMyHere);

module.exports = router;