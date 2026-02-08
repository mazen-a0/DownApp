const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("Message", messageSchema);