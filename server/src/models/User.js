const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pushToken: { type: String, default: null },
  groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  deviceId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);