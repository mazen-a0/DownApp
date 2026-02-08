const express = require("express");
const { createUser, getMyHere, lookupUsers } = require("../controllers/users.controller"); // ✅ add lookupUsers
const requireUser = require("../middleware/requireUser");

const router = express.Router();

// Public: bootstrap/upsert user by deviceId
router.post("/", createUser);
router.post("/upsert", createUser);

// Protected: requires x-user-id
router.get("/me/here", requireUser, getMyHere);

// ✅ NEW: bulk lookup names for userIds (protected)
router.post("/lookup", requireUser, lookupUsers);

module.exports = router;