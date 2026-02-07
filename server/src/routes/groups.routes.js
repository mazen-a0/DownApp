const express = require("express");
const { createGroup, joinGroup } = require("../controllers/groups.controller");

const router = express.Router();

router.post("/", createGroup);       // POST /groups
router.post("/join", joinGroup);     // POST /groups/join

module.exports = router;