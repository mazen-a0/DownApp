const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  tag: { 
    type: String, 
    enum: ['study', 'bar', 'club', 'library', 'stay_in', 'food', 'gym', 'other'],
    required: true 
  },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  placeLabel: String,

  // ✅ NEW
  emoji: { type: String, default: null },

  participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hereIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);