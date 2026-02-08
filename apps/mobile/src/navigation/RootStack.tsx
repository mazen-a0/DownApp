import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Tabs from "./Tabs";

import BootScreen from "../screens/auth/BootScreen";
import NameScreen from "../screens/auth/NameScreen";
import GroupScreen from "../screens/auth/GroupScreen";

import CreateEventScreen from "../screens/CreateEventScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import GroupProfileScreen from "../screens/GroupProfileScreen";

export type RootStackParamList = {
  Boot: undefined;
  Name: undefined;
  Group: undefined;
  Tabs: undefined;
  CreateEvent: undefined;
  EventDetail: { eventId: string };
  GroupProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Boot">
      <Stack.Screen name="Boot" component={BootScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Name" component={NameScreen} options={{ title: "Your name" }} />
      <Stack.Screen name="Group" component={GroupScreen} options={{ title: "Group" }} />

      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />

      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: "New Event" }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Event" }} />

      <Stack.Screen name="GroupProfile" component={GroupProfileScreen} options={{ title: "Group settings" }} />
    </Stack.Navigator>
  );
}