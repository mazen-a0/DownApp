const User = require('../models/User');
const Group = require('../models/Group');

// Send push notification via Expo
async function sendPushNotification(pushToken, title, body, data = {}) {
  if (process.env.DISABLE_PUSH_NOTIFICATIONS === 'true') {
  return;
}
  
  if (!pushToken || !pushToken.startsWith('ExponentPushToken')) {
    console.log('Invalid push token:', pushToken);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data?.status === 'error') {
      console.error('Push notification error:', result.data.message);
    } else {
      console.log('Push notification sent:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

// Send notification to a specific user
async function notifyUser(userId, title, body, data = {}) {
  const user = await User.findById(userId).select('pushToken');
  
  if (!user || !user.pushToken) {
    console.log('User has no push token:', userId);
    return;
  }

  return await sendPushNotification(user.pushToken, title, body, data);
}

// Send notification to all group members except the sender
async function notifyGroup(groupId, senderId, title, body, data = {}) {
  const group = await Group.findById(groupId).populate('memberIds', 'pushToken');
  
  if (!group) return;

  const notifications = [];
  
  for (const member of group.memberIds) {
    // Skip the person who triggered the notification
    if (member._id.toString() === senderId.toString()) continue;
    
    if (member.pushToken && member.pushToken.startsWith('ExponentPushToken')) {
      notifications.push(
        sendPushNotification(member.pushToken, title, body, data)
      );
    }
  }

  return await Promise.all(notifications);
}

// Send notification to event participants
async function notifyEventParticipants(event, senderId, title, body, data = {}) {
  const users = await User.find({
    _id: { $in: event.participantIds }
  }).select('pushToken');

  const notifications = [];
  
  for (const user of users) {
    // Skip the person who triggered the notification
    if (user._id.toString() === senderId.toString()) continue;
    
    if (user.pushToken && user.pushToken.startsWith('ExponentPushToken')) {
      notifications.push(
        sendPushNotification(user.pushToken, title, body, data)
      );
    }
  }

  return await Promise.all(notifications);
}

module.exports = {
  sendPushNotification,
  notifyUser,
  notifyGroup,
  notifyEventParticipants
};