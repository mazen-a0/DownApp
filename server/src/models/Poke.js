const mongoose = require("mongoose");

const pokeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  message: { type: String, required: true, maxlength: 80 }, // ✅ LIMIT HERE (pick 60/80/100)

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Poke", pokeSchema);