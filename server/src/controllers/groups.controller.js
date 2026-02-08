const groupsService = require("../services/groups.service");

async function createGroup(req, res, next) {
  try {
    const { name } = req.body;
    const userId = req.userId;

    const group = await groupsService.createGroup({ name, userId });

    res.status(201).json({
      groupId: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
    });
  } catch (err) {
    next(err);
  }
}

async function joinGroup(req, res, next) {
  try {
    const { inviteCode } = req.body;
    const userId = req.userId;

    const group = await groupsService.joinGroup({ inviteCode, userId });

    res.json({
      groupId: group._id,
      name: group.name,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyGroup(req, res, next) {
  try {
    const userId = req.userId;

    const group = await groupsService.getMyGroup({ userId });

    // If user has no group yet
    if (!group) {
      return res.json({ group: null });
    }

    res.json({
      group: {
        groupId: group._id,
        name: group.name,
        inviteCode: group.inviteCode,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createGroup, joinGroup, getMyGroup };