import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { loadSession } from "../../state/session";
import { setUserIdHeader, clearUserIdHeader } from "../../api/client";
import { setupNotificationListeners } from "../../utils/pushNotifications"; // ✅ ADD THIS


export default function BootScreen({ navigation }: any) {
  const [status, setStatus] = useState("Booting…");

  useEffect(() => {
    let didNavigate = false;

    // NEW: Setup notification listeners immediately (before we know if user is logged in)
    const cleanupNotifications = setupNotificationListeners(navigation);

    const fallback = setTimeout(() => {
      if (!didNavigate) {
        setStatus("Boot timeout — sending you to Name screen…");
        navigation.replace("Name");
      }
    }, 2500);

    (async () => {
      try {
        setStatus("Loading session…");
        const session = await loadSession();

        // ✅ Always keep header correct
        if (session.userId) setUserIdHeader(session.userId);
        else clearUserIdHeader();

        setStatus(
          `Session loaded: userId=${session.userId ? "yes" : "no"}, groupId=${
            session.groupId ? "yes" : "no"
          }`
        );

        if (!session.userId) {
          didNavigate = true;
          clearTimeout(fallback);
          navigation.replace("Name");
          return;
        }

        if (!session.groupId) {
          didNavigate = true;
          clearTimeout(fallback);
          navigation.replace("Group");
          return;
        }

        didNavigate = true;
        clearTimeout(fallback);
        navigation.replace("Tabs");
      } catch (e: any) {
        clearUserIdHeader();
        setStatus("Boot error — sending you to Name screen…");
        didNavigate = true;
        clearTimeout(fallback);
        navigation.replace("Name");
      }
    })();

    return () => {
      clearTimeout(fallback);
      cleanupNotifications(); // NEW: CLEANUP NOTIFICATION LISTENERS
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 12, color: "#555" }}>{status}</Text>
    </View>
  );
}