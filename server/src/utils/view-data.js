require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function viewData() {
  await connectDB();
  
  const User = require('../models/User');
  const Group = require('../models/Group');
  const Event = require('../models/Event');
  const Poke = require('../models/Poke');
  
  console.log('\n=== USERS ===');
  const users = await User.find();
  users.forEach(u => console.log(`${u.name} (${u._id})`));
  
  console.log('\n=== GROUPS ===');
  const groups = await Group.find();
  groups.forEach(g => console.log(`${g.name} - Code: ${g.inviteCode} - Members: ${g.memberIds.length}`));
  
  console.log('\n=== EVENTS ===');
  const events = await Event.find();
  events.forEach(e => {
    console.log(`${e.title} (${e.tag})`);
    console.log(`  Down: ${e.participantIds.length}, Here: ${e.hereIds.length}`);
  });
  
  console.log('\n=== POKES ===');
  const pokes = await Poke.find();
  console.log(`Total pokes: ${pokes.length}`);
  
  await mongoose.connection.close();
}

viewData().catch(console.error);