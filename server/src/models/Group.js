const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);