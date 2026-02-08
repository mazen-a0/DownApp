import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarScreen from "../screens/CalendarScreen";
import ChatScreen from "../screens/ChatScreen";
import AddScreen from "../screens/AddScreen";
import LocationScreen from "../screens/LocationScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const unsub = navigation.addListener("groupChanged", () => {
      // Force current tab to re-focus, which triggers your useFocusEffect(load)
      // and refreshes data everywhere.
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      navigation.navigate(currentRoute.name);
    });

    return unsub;
  }, [navigation]);

  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />

      <Tab.Screen
        name="Add"
        component={AddScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("CreateEvent");
          },
        }}
      />

      <Tab.Screen name="Location" component={LocationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}