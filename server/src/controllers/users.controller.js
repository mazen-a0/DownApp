const { upsertUser } = require("../services/users.service");

async function createUser(req, res, next) {
  try {
    const { name, deviceId, pushToken } = req.body;

    const user = await upsertUser({ name, deviceId, pushToken });

    res.status(200).json({
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser };