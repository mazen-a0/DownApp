console.log('Starting seed script...');
require('dotenv').config();
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Poke = require('../models/Poke');
const groupsService = require("../services/groups.service");
const eventsService = require("../services/events.service");

async function seed() {
  await connectDB();
  console.log('Clearing database...');
  
  await User.deleteMany({});
  await Group.deleteMany({});
  await Event.deleteMany({});
  await Poke.deleteMany({});
  
  console.log('Creating users...');
  const amir = await User.create({ name: 'Amir', pushToken: 'demo-token-1' });
  const ishita = await User.create({ name: 'Ishita', pushToken: 'demo-token-2' });
  const evan = await User.create({ name: 'Evan', pushToken: 'demo-token-3' });
  
  console.log('Creating group...');
  const group = await createGroup('McGill Squad', amir._id);
  await Group.findByIdAndUpdate(group._id, {
    $addToSet: { memberIds: { $each: [ishita._id, evan._id] } }
  });
  await User.updateMany(
    { _id: { $in: [ishita._id, evan._id] } },
    { $push: { groupIds: group._id } }
  );
  
  console.log('Creating events...');
  const now = new Date();
  const tonight = new Date(now);
  tonight.setHours(19, 0, 0, 0);
  
  const event1 = await createEvent({
    groupId: group._id,
    creatorId: amir._id,
    title: 'Study sesh @ McLennan',
    tag: 'library',
    startAt: tonight,
    endAt: new Date(tonight.getTime() + 3 * 60 * 60 * 1000),
    placeLabel: 'McLennan Library',
    participantIds: [amir._id, ishita._id, evan._id]
  });
  
  await checkIn(event1._id, ishita._id);
  
  const event2 = await createEvent({
    groupId: group._id,
    creatorId: ishita._id,
    title: 'Late night poutine run',
    tag: 'food',
    startAt: new Date(tonight.getTime() + 4 * 60 * 60 * 1000),
    endAt: new Date(tonight.getTime() + 5 * 60 * 60 * 1000),
    placeLabel: 'La Banquise',
    participantIds: [amir._id, ishita._id]
  });
  
  console.log('\n✅ Seed data created!');
  console.log('Invite code:', group.inviteCode);
  console.log('Amir ID:', amir._id);
  console.log('Ishita ID:', ishita._id);
  console.log('Evan ID:', evan._id);
  
  await mongoose.connection.close();
}

seed().catch(console.error);