import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/navigation/RootStack";
import * as Notifications from "expo-notifications";

// ✅ Foreground notifications: show banner/alert while app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // ✅ this is the missing piece
    shouldShowBanner: true, // iOS (newer behavior)
    shouldShowList: true,   // iOS Notification Center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      const perms = await Notifications.getPermissionsAsync();

      if (perms.status !== "granted") {
        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowSound: true,
            allowBadge: false,
          },
        });
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}