import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";

import { repo, Event } from "../repositories";

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await repo.listEvents();
    setEvents(data);
  };

  useEffect(() => {
    load();
  }, []);

  // Refresh when you come back from CreateEvent or EventDetail
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Today</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const time = `${dayjs(item.startAt).format("h:mm A")}–${dayjs(item.endAt).format("h:mm A")}`;

          return (
            <Pressable
              onPress={() => navigation.navigate("EventDetail", { eventId: item.eventId })}
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
    backgroundColor: "#BAF2E9",
  },
  title: { fontSize: 18, fontWeight: "700" },
  meta: { marginTop: 6, color: "#555" },
});