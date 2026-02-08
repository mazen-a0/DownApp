import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: "#BAF2E9", // same light teal as tab bar
        },
        headerTitleStyle: {
          color: "#0F172A", // dark slate text for contrast
          fontWeight: "600",
        },
        headerTintColor: "#14B8A6", // teal for back buttons / icons
        tabBarActiveTintColor: "#2DD4BF", // light teal (active)
        tabBarInactiveTintColor: "#94A3B8", // soft gray (inactive)
        tabBarStyle: {
          backgroundColor: "#ECFEFF", // very light teal background
          borderTopColor: "#99F6E4", // subtle teal border
        },
        tabBarIcon: ({ color, size }) => {
          let name: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "Calendar") name = "calendar-outline";
          if (route.name === "Chat") name = "chatbubble-ellipses-outline";
          if (route.name === "Add") name = "add-circle-outline";
          if (route.name === "Location") name = "location-outline";
          if (route.name === "Profile") name = "person-circle-outline";

          // Make the Add icon a bit bigger
          const finalSize = route.name === "Add" ? size + 8 : size;

          return <Ionicons name={name} size={finalSize} color={color} />;
        },
      })}
    >
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
        options={{
          // optional: hide label under the + button
          tabBarLabel: "",
        }}
      />

      <Tab.Screen name="Location" component={LocationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}