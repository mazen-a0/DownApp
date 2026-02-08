const express = require("express");
const {
  createGroup,
  joinGroup,
  getMyGroup,
  getMyGroups,
  fetchGroup,
  updateGroupName,
} = require("../controllers/groups.controller");

const router = express.Router();

router.post("/", createGroup);           // POST /groups
router.post("/join", joinGroup);         // POST /groups/join

// IMPORTANT: keep these ABOVE "/:groupId"
router.get("/me", getMyGroup);           // GET /groups/me (current group)
router.get("/mine", getMyGroups);        // GET /groups/mine (all groups)

// IMPORTANT: param routes go last
router.get("/:groupId", fetchGroup);         // GET /groups/:groupId
router.patch("/:groupId", updateGroupName);  // PATCH /groups/:groupId

module.exports = router;