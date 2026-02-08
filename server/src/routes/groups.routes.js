const express = require("express");
const { createGroup, joinGroup, getMyGroup, getMyGroups } = require("../controllers/groups.controller");

const router = express.Router();

router.post("/", createGroup);       // POST /groups
router.post("/join", joinGroup);     // POST /groups/join

// Use array version for the app:
router.get("/me", getMyGroups);      // GET /groups/me

module.exports = router;