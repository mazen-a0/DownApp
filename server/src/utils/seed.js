console.log('=== SEED SCRIPT STARTING ===');

require('dotenv').config();
console.log('dotenv loaded');

const mongoose = require('mongoose');
console.log('mongoose loaded');

const connectDB = require('../config/db');
console.log('connectDB loaded');

const User = require('../models/User');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Poke = require('../models/Poke');
const Message = require('../models/Message');
console.log('models loaded');

// Import Person B's services
const { upsertUser } = require('../services/users.service');
const { createGroup } = require('../services/groups.service');
const { createEvent, joinEvent, checkInEvent } = require('../services/events.service');
console.log('services loaded');

async function seed() {
  console.log('seed function called');
  
  try {
    await connectDB();
    console.log('Connected to DB');
    
    console.log('Clearing database...');
    await User.deleteMany({});
    await Group.deleteMany({});
    await Event.deleteMany({});
    await Poke.deleteMany({});
    await Message.deleteMany({});
    console.log('Database cleared');
    
    console.log('Creating users...');
    
    const amir = await upsertUser({ 
      name: 'Amir', 
      deviceId: 'device-amir-001',
      pushToken: 'ExponentPushToken[amir]' 
    });
    
    const ishita = await upsertUser({ 
      name: 'Ishita', 
      deviceId: 'device-ishita-002',
      pushToken: 'ExponentPushToken[ishita]' 
    });
    
    const evan = await upsertUser({ 
      name: 'Evan', 
      deviceId: 'device-evan-003',
      pushToken: 'ExponentPushToken[evan]' 
    });
    
    console.log('Users created');
    console.log('Amir ID:', amir._id);
    console.log('Ishita ID:', ishita._id);
    console.log('Evan ID:', evan._id);
    
    console.log('Creating group...');
    
    // Create group with Amir as creator
    const group = await createGroup({ 
      name: 'McGill Squad', 
      userId: amir._id 
    });
    
    console.log('Group created:', group.name, 'Code:', group.inviteCode);
    
    // Manually add Ishita and Evan to the group
    await Group.findByIdAndUpdate(group._id, {
      $addToSet: { memberIds: { $each: [ishita._id, evan._id] } }
    });
    
    await User.updateMany(
      { _id: { $in: [ishita._id, evan._id] } },
      { $addToSet: { groupIds: group._id } }
    );
    
    console.log('Added Ishita and Evan to group');
    
    console.log('Creating events...');
    const now = new Date();
    const tonight = new Date(now);
    tonight.setHours(19, 0, 0, 0);
    
    // Create event 1 - Study session
    const event1 = await createEvent({
      userId: amir._id,
      payload: {
        groupId: group._id,
        title: 'Study sesh @ McLennan',
        tag: 'library',
        startAt: tonight.toISOString(),
        endAt: new Date(tonight.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        placeLabel: 'McLennan Library'
      }
    });
    
    console.log('Event 1 created:', event1.title);
    
    // Ishita and Evan join the event
    await joinEvent({ userId: ishita._id, eventId: event1._id });
    await joinEvent({ userId: evan._id, eventId: event1._id });
    
    // Ishita checks in
    await checkInEvent({ userId: ishita._id, eventId: event1._id });
    
    console.log('Event 1 participants added, Ishita checked in');
    
    // Create event 2 - Poutine run
    const event2 = await createEvent({
      userId: ishita._id,
      payload: {
        groupId: group._id,
        title: 'Late night poutine run',
        tag: 'food',
        startAt: new Date(tonight.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(tonight.getTime() + 5 * 60 * 60 * 1000).toISOString(),
        placeLabel: 'La Banquise'
      }
    });
    
    console.log('Event 2 created:', event2.title);
    
    // Amir joins event 2
    await joinEvent({ userId: amir._id, eventId: event2._id });
    
    console.log('Creating sample messages...');
    
    // General group messages
    await Message.create({
      groupId: group._id,
      eventId: null, // General chat
      fromUserId: amir._id,
      text: 'Hey everyone! 👋',
      createdAt: new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
    });
    
    await Message.create({
      groupId: group._id,
      eventId: null,
      fromUserId: ishita._id,
      text: 'What\'s everyone up to tonight?',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 min ago
    });
    
    await Message.create({
      groupId: group._id,
      eventId: null,
      fromUserId: evan._id,
      text: 'Down to hang! Any plans?',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000) // 15 min ago
    });
    
    // Event-specific messages (for event1 - study session)
    await Message.create({
      groupId: group._id,
      eventId: event1._id,
      fromUserId: amir._id,
      text: 'Who else is coming to study?',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000)
    });
    
    await Message.create({
      groupId: group._id,
      eventId: event1._id,
      fromUserId: ishita._id,
      text: 'I\'m here already! Got us a good spot on the 3rd floor',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000)
    });
    
    await Message.create({
      groupId: group._id,
      eventId: event1._id,
      fromUserId: evan._id,
      text: 'On my way, 5 mins out',
      createdAt: new Date(now.getTime() - 2 * 60 * 1000)
    });
    
    // Messages for event2 (poutine run)
    await Message.create({
      groupId: group._id,
      eventId: event2._id,
      fromUserId: ishita._id,
      text: 'Classic or all-dressed? 🍟',
      createdAt: new Date(now.getTime() - 8 * 60 * 1000)
    });
    
    await Message.create({
      groupId: group._id,
      eventId: event2._id,
      fromUserId: amir._id,
      text: 'All-dressed for sure!',
      createdAt: new Date(now.getTime() - 3 * 60 * 1000)
    });
    
    console.log('Sample messages created');
    
    console.log('\n✅ Seed data created!');
    console.log('==========================================');
    console.log('Invite code:', group.inviteCode);
    console.log('Group ID:', group._id);
    console.log('------------------------------------------');
    console.log('User IDs:');
    console.log('  Amir:', amir._id, '(device: device-amir-001)');
    console.log('  Ishita:', ishita._id, '(device: device-ishita-002)');
    console.log('  Evan:', evan._id, '(device: device-evan-003)');
    console.log('------------------------------------------');
    console.log('Event IDs:');
    console.log('  Study session:', event1._id);
    console.log('  Poutine run:', event2._id);
    console.log('==========================================');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('ERROR IN SEED:', error);
    process.exit(1);
  }
}

console.log('About to call seed()');
seed().catch(err => {
  console.error('UNCAUGHT ERROR:', err);
  process.exit(1);
});