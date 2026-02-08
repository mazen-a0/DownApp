const express = require("express");
const {
  listEvents,
  createEvent,
  joinEvent,
  leaveEvent,
  checkInEvent,
  checkOutEvent,
  createPoke,
} = require("../controllers/events.controller");

const router = express.Router();

// GET /events?groupId=...&from=...&to=...
router.get("/", listEvents);

// GET /groups/:groupId/members (NEW FROM SOFIA)
router.get('/groups/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  const members = await getGroupMembers(groupId);
  
  res.json({
    members: members.map(m => ({
      userId: m._id,
      name: m.name
    }))
  });
});

// POST /events
router.post("/", createEvent);

// POST /events/:eventId/join
router.post("/:eventId/join", joinEvent);

// POST /events/:eventId/leave
router.post("/:eventId/leave", leaveEvent);

// POST /events/:eventId/checkin
router.post("/:eventId/checkin", checkInEvent);

// POST /events/:eventId/checkout
router.post("/:eventId/checkout", checkOutEvent);

router.post('/:eventId/pokes', createPoke);




module.exports = router;