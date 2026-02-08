const mongoose = require("mongoose");

module.exports = function requireUser(req, res, next) {
  const userId = req.header("x-user-id");

  if (!userId) {
    return res.status(401).json({
      error: "NO_USER_ID",
      message: "Missing x-user-id header",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      error: "INVALID_USER_ID",
      message: "x-user-id must be a valid Mongo ObjectId",
    });
  }

  req.userId = userId;
  next();
};