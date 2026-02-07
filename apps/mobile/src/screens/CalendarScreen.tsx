import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";

import { fetchEventsForToday } from "../api/events";
import type { Event } from "../data/demoEvents";

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const data = await fetchEventsForToday();
      setEvents(data);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Today</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const time = `${dayjs(item.startAt).format("h:mm A")}–${dayjs(
            item.endAt
          ).format("h:mm A")}`;

          return (
            <Pressable
              onPress={() => navigation.navigate("EventDetail", { event: item })}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {time} • {item.tag}
                  {item.placeLabel ? ` • ${item.placeLabel}` : ""}
                </Text>
                <Text style={styles.meta}>
                  Down: {item.participantIds.length} • Here: {item.hereIds.length}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20 },
  h1: { fontSize: 28, fontWeight: "800", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "white",
  },
  title: { fontSize: 18, fontWeight: "700" },
  meta: { marginTop: 6, color: "#555" },
});