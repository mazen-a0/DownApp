// delete before PR


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  pushToken: String,
  groupIds: [mongoose.Schema.Types.ObjectId],
});

module.exports = mongoose.model("User", userSchema);