const usersService = require("../services/users.service");

async function createUser(req, res, next) {
  try {
    const { name, pushToken } = req.body;
    const user = await usersService.createUser({ name, pushToken });

    res.status(201).json({ userId: user._id, name: user.name });
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser };