const User = require("../models/User");
const Group = require("../models/Group");

/**
 * Expo Push endpoint
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";

// --------------------
// fetch helper (Node compatibility)
// --------------------
async function getFetch() {
  if (typeof fetch === "function") return fetch;

  // If your node runtime doesn't have fetch (Node < 18), try node-fetch if installed.
  // If not installed, we log a clear error and return null.
  try {
    // node-fetch v3 is ESM; dynamic import works in CommonJS
    const mod = await import("node-fetch");
    return mod.default;
  } catch (e) {
    console.log(
      "[PUSH] ERROR: global fetch is not available, and node-fetch is not installed. " +
        "Push cannot be sent from this server runtime."
    );
    return null;
  }
}

// --------------------
// token validation
// --------------------
function isValidExpoPushToken(token) {
  const t = String(token || "");
  // Expo tokens look like: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
  return t.startsWith("ExponentPushToken[") && t.endsWith("]");
}

// --------------------
// receipts checker (optional but VERY useful for debugging)
// --------------------
async function fetchReceipts(fetchImpl, receiptIds) {
  if (!receiptIds.length) return null;

  try {
    const response = await fetchImpl(EXPO_RECEIPTS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: receiptIds }),
    });

    const json = await response.json();
    console.log("[PUSH] Expo receipts response:", JSON.stringify(json));
    return json;
  } catch (e) {
    console.error("[PUSH] Failed to fetch receipts:", e);
    return null;
  }
}

// --------------------
// core sender
// --------------------
async function sendPushNotification(pushToken, title, body, data = {}) {
  console.log("[PUSH] sendPushNotification called", {
    disabled: process.env.DISABLE_PUSH_NOTIFICATIONS,
    hasFetch: typeof fetch === "function",
    pushTokenPreview: pushToken ? String(pushToken).slice(0, 25) + "..." : null,
    title,
    body,
    data,
  });

  if (process.env.DISABLE_PUSH_NOTIFICATIONS === "true") {
    console.log("[PUSH] DISABLED via env var, skipping send");
    return { skipped: true, reason: "DISABLED_PUSH_NOTIFICATIONS" };
  }

  if (!pushToken) {
    console.log("[PUSH] No pushToken provided, skipping send");
    return { skipped: true, reason: "NO_PUSH_TOKEN" };
  }

  if (!isValidExpoPushToken(pushToken)) {
    console.log("[PUSH] Invalid push token format, skipping:", pushToken);
    return { skipped: true, reason: "INVALID_PUSH_TOKEN" };
  }

  const fetchImpl = await getFetch();
  if (!fetchImpl) {
    return { skipped: true, reason: "NO_FETCH_AVAILABLE" };
  }

  // Expo expects an array of messages (batch). Even for 1 message, send an array.
  const messages = [
    {
      to: String(pushToken),
      sound: "default",
      title,
      body,
      data,
    },
  ];

  console.log("[PUSH] sending to Expo...", { to: String(pushToken) });

  try {
    const response = await fetchImpl(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log("[PUSH] Expo push response:", JSON.stringify(result));

    // Expo returns { data: [ { status: "ok", id: "..." } ] } or error objects
    const tickets = Array.isArray(result?.data) ? result.data : [];
    if (!tickets.length) {
      console.log("[PUSH] WARNING: Expo response had no ticket array. Raw:", result);
      return { ok: false, result };
    }

    // Log each ticket status clearly
    const receiptIds = [];
    for (const t of tickets) {
      if (t?.status === "error") {
        console.error("[PUSH] Expo ticket ERROR:", JSON.stringify(t));
      } else {
        console.log("[PUSH] Expo ticket OK:", JSON.stringify(t));
        if (t?.id) receiptIds.push(t.id);
      }
    }

    // Optional: receipts can reveal delivery failures (DeviceNotRegistered, etc.)
    // This is super useful when "status: ok" but nothing shows on device.
    if (receiptIds.length) {
      setTimeout(() => {
        fetchReceipts(fetchImpl, receiptIds);
      }, 1500);
    }

    return { ok: true, result, tickets };
  } catch (error) {
    console.error("[PUSH] Failed to send push notification:", error);
    return { ok: false, error: String(error) };
  }
}

// --------------------
// public helpers
// --------------------
async function notifyUser(userId, title, body, data = {}) {
  console.log("[PUSH] notifyUser", { userId, title, body, data });

  const user = await User.findById(userId).select("pushToken name");
  console.log("[PUSH] notifyUser DB lookup result", {
    found: !!user,
    name: user?.name ?? null,
    hasPushToken: !!user?.pushToken,
    pushTokenPreview: user?.pushToken ? String(user.pushToken).slice(0, 25) + "..." : null,
    validToken: user?.pushToken ? isValidExpoPushToken(user.pushToken) : false,
  });

  if (!user || !user.pushToken) {
    console.log("[PUSH] User has no push token (or not found), skipping", userId);
    return { skipped: true, reason: "USER_NO_TOKEN_OR_NOT_FOUND" };
  }

  return await sendPushNotification(user.pushToken, title, body, data);
}

async function notifyGroup(groupId, senderId, title, body, data = {}) {
  console.log("[PUSH] notifyGroup", { groupId, senderId, title, body, data });

  const group = await Group.findById(groupId).populate("memberIds", "pushToken name");
  console.log("[PUSH] notifyGroup group lookup", {
    found: !!group,
    memberCount: group?.memberIds?.length ?? 0,
  });

  if (!group) return { skipped: true, reason: "GROUP_NOT_FOUND" };

  const notifications = [];

  for (const member of group.memberIds) {
    const memberId = member?._id?.toString?.() ?? String(member?._id);
    if (memberId === String(senderId)) continue;

    const token = member.pushToken;
    console.log("[PUSH] notifyGroup member", {
      memberId,
      name: member?.name ?? null,
      hasToken: !!token,
      validToken: token ? isValidExpoPushToken(token) : false,
      tokenPreview: token ? String(token).slice(0, 25) + "..." : null,
    });

    if (token && isValidExpoPushToken(token)) {
      notifications.push(sendPushNotification(token, title, body, data));
    }
  }

  return await Promise.all(notifications);
}

async function notifyEventParticipants(event, senderId, title, body, data = {}) {
  console.log("[PUSH] notifyEventParticipants", {
    eventId: event?._id?.toString?.() ?? null,
    senderId,
    title,
    body,
    data,
    participantCount: event?.participantIds?.length ?? 0,
  });

  const users = await User.find({ _id: { $in: event.participantIds } }).select("pushToken name");

  const notifications = [];

  for (const user of users) {
    const uid = user._id.toString();
    if (uid === String(senderId)) continue;

    console.log("[PUSH] notifyEventParticipants user", {
      uid,
      name: user?.name ?? null,
      hasToken: !!user.pushToken,
      validToken: user.pushToken ? isValidExpoPushToken(user.pushToken) : false,
      tokenPreview: user.pushToken ? String(user.pushToken).slice(0, 25) + "..." : null,
    });

    if (user.pushToken && isValidExpoPushToken(user.pushToken)) {
      notifications.push(sendPushNotification(user.pushToken, title, body, data));
    }
  }

  return await Promise.all(notifications);
}

module.exports = {
  sendPushNotification,
  notifyUser,
  notifyGroup,
  notifyEventParticipants,
};