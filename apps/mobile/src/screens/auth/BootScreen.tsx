import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { loadSession } from "../../state/session";

const DEV_FORCE_ONBOARDING = true; // <-- set to false when you want real flow

export default function BootScreen({ navigation }: any) {
  useEffect(() => {
    (async () => {
      if (DEV_FORCE_ONBOARDING) {
        navigation.reset({ index: 0, routes: [{ name: "Name" }] });
        return;
      }

      const s = await loadSession();

      // If user + group exist -> go straight to app
      if (s.userId && s.groupId) {
        navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
        return;
      }

      // If user exists but no group -> go to Group
      if (s.userId && !s.groupId) {
        navigation.reset({ index: 0, routes: [{ name: "Group" }] });
        return;
      }

      // Otherwise -> Name
      navigation.reset({ index: 0, routes: [{ name: "Name" }] });
    })();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}