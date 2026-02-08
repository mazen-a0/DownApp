require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function viewData() {
  await connectDB();
  
  const User = require('../models/User');
  const Group = require('../models/Group');
  const Event = require('../models/Event');
  const Poke = require('../models/Poke');
  const Message = require('../models/Message');
  
  console.log('\n=== USERS ===');
  const users = await User.find();
  users.forEach(u => console.log(`${u.name} (${u._id}) - device: ${u.deviceId || 'N/A'}`));
  
  console.log('\n=== GROUPS ===');
  const groups = await Group.find();
  groups.forEach(g => console.log(`${g.name} - Code: ${g.inviteCode} - Members: ${g.memberIds.length} - ID: ${g._id}`));
  
  console.log('\n=== EVENTS ===');
  const events = await Event.find();
  events.forEach(e => {
    console.log(`${e.title} (${e.tag}) - ID: ${e._id}`);
    console.log(`  Down: ${e.participantIds.length}, Here: ${e.hereIds.length}`);
  });
  
  console.log('\n=== POKES ===');
  const pokes = await Poke.find();
  console.log(`Total pokes: ${pokes.length}`);
  
  console.log('\n=== MESSAGES ===');
  const messages = await Message.find().sort({ createdAt: 1 });
  
  const generalMsgs = messages.filter(m => !m.eventId);
  const eventMsgs = messages.filter(m => m.eventId);
  
  console.log(`General messages: ${generalMsgs.length}`);
  generalMsgs.forEach(m => {
    console.log(`  "${m.text}" - from ${m.fromUserId}`);
  });
  
  console.log(`\nEvent messages: ${eventMsgs.length}`);
  const eventGroups = {};
  eventMsgs.forEach(m => {
    if (!eventGroups[m.eventId]) eventGroups[m.eventId] = [];
    eventGroups[m.eventId].push(m);
  });
  
  Object.keys(eventGroups).forEach(eventId => {
    console.log(`\n  Event ${eventId}:`);
    eventGroups[eventId].forEach(m => {
      console.log(`    "${m.text}" - from ${m.fromUserId}`);
    });
  });
  
  await mongoose.connection.close();
}

viewData().catch(console.error);