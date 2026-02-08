const express = require("express");
const { createGroup, joinGroup, getMyGroup } = require("../controllers/groups.controller");

const router = express.Router();

router.post("/", createGroup);       // POST /groups
router.post("/join", joinGroup);     // POST /groups/join
router.get("/me", getMyGroup);

module.exports = router;