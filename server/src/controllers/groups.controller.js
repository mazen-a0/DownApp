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
      inviteCode: group.inviteCode, // frontend needs this
    });
  } catch (err) {
    next(err);
  }
}

// current group = first groupId on the user (MVP)
async function getMyGroup(req, res, next) {
  try {
    const userId = req.userId;

    const group = await groupsService.getMyGroup({ userId });

    // Return either null or GroupDto directly (frontend-friendly)
    if (!group) return res.json(null);

    res.json({
      groupId: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
    });
  } catch (err) {
    next(err);
  }
}

// all groups user is in
async function getMyGroups(req, res, next) {
  try {
    const userId = req.userId;

    const groups = await groupsService.getMyGroups({ userId });

    res.json(
      (groups || []).map((g) => ({
        groupId: g._id,
        name: g.name,
        inviteCode: g.inviteCode,
      }))
    );
  } catch (err) {
    next(err);
  }
}

async function fetchGroup(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId } = req.params;

    const group = await groupsService.fetchGroup({ groupId, userId });

    res.json({
      groupId: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
      memberIds: group.memberIds || [],
    });
  } catch (err) {
    next(err);
  }
}

async function updateGroupName(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId } = req.params;
    const { name } = req.body;

    const group = await groupsService.updateGroupName({ groupId, userId, name });

    res.json({
      groupId: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
      memberIds: group.memberIds || [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGroup,
  joinGroup,
  getMyGroup,
  getMyGroups,
  fetchGroup,
  updateGroupName,
};