import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { loadSession } from "../../state/session";
import { setUserIdHeader } from "../../api/client"; // ✅ add this

export default function BootScreen({ navigation }: any) {
  const [status, setStatus] = useState("Booting…");

  useEffect(() => {
    let didNavigate = false;

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

        // ✅ set x-user-id header for ALL future API calls
        if (session.userId) {
          setUserIdHeader(session.userId);
        }

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
        setStatus("Boot error — sending you to Name screen…");
        didNavigate = true;
        clearTimeout(fallback);
        navigation.replace("Name");
      }
    })();

    return () => clearTimeout(fallback);
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 12, color: "#555" }}>{status}</Text>
    </View>
  );
}