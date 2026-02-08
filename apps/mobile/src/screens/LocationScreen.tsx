import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";

import { repo, type Event } from "../repositories";
import { getUserIdOrThrow } from "../state/getUser";
import { nameForUserId } from "../utils/userNames";

type HereRecord = {
  userId: string;
  eventId: string;
  title: string;
  placeLabel: string;
  endAt: string;
};

export default function LocationScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const load = async () => {
    const [uid, list] = await Promise.all([getUserIdOrThrow(), repo.listEvents()]);
    setUserId(uid);
    setEvents(list);
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Refresh when returning to this tab (ex: after switching groups)
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

  const hereList: HereRecord[] = useMemo(() => {
    const out: HereRecord[] = [];
    for (const e of events) {
      if (!e.placeLabel) continue;
      for (const uid of e.hereIds) {
        out.push({
          userId: uid,
          eventId: e.eventId,
          title: e.title,
          placeLabel: e.placeLabel,
          endAt: e.endAt,
        });
      }
    }

    out.sort((a, b) => {
      const p = a.placeLabel.localeCompare(b.placeLabel);
      if (p !== 0) return p;
      return nameForUserId(a.userId).localeCompare(nameForUserId(b.userId));
    });

    return out;
  }, [events]);

  const currentHereForMe = useMemo(() => {
    return hereList.find((x) => x.userId === userId) || null;
  }, [hereList, userId]);

  const doCheckIn = async (targetEventId: string) => {
    await repo.checkIn(targetEventId);
    await load();
  };

  const doCheckout = async (targetEventId: string) => {
    await repo.checkout(targetEventId);
    await load();
  };

  const onToggleHereForEvent = async (targetEventId: string, label: string) => {
    if (!userId) return;

    if (currentHereForMe?.eventId === targetEventId) {
      await doCheckout(targetEventId);
      return;
    }

    if (currentHereForMe && currentHereForMe.eventId !== targetEventId) {
      Alert.alert(
        "Switch location?",
        `You're currently checked in at:\n\n${currentHereForMe.title} (${currentHereForMe.placeLabel})\n\nCheck out and check in at:\n${label}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, switch",
            onPress: async () => {
              await doCheckIn(targetEventId);
            },
          },
        ]
      );
      return;
    }

    await doCheckIn(targetEventId);
  };

  const eventsWithPlaces = useMemo(() => {
    return events
      .filter((e) => !!e.placeLabel)
      .sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());
  }, [events]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.h1}>Where people are</Text>
      <Text style={styles.sub}>Based on “I’m here” check-ins (no GPS). Pull down to refresh.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Checked in</Text>

        {hereList.length === 0 ? (
          <Text style={styles.small}>No one is checked in yet.</Text>
        ) : (
          hereList.map((x) => (
            <View key={`${x.userId}-${x.eventId}`} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {x.userId === userId ? `${nameForUserId(x.userId)} (you)` : nameForUserId(x.userId)}
                </Text>
                <Text style={styles.meta}>
                  {x.placeLabel} • {x.title}
                </Text>
              </View>

              {x.userId === userId ? (
                <Pressable style={styles.iconBtn} onPress={() => doCheckout(x.eventId)}>
                  <Ionicons name="log-out-outline" size={20} color="#111" />
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Places you can check into</Text>

        {eventsWithPlaces.length === 0 ? (
          <Text style={styles.small}>Create an event with a place to see it here.</Text>
        ) : (
          eventsWithPlaces.map((e) => {
            const label = `${e.title} (${e.placeLabel})`;
            const amHere = currentHereForMe?.eventId === e.eventId;

            return (
              <View key={e.eventId} style={styles.eventRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{e.placeLabel}</Text>
                  <Text style={styles.meta}>{e.title}</Text>
                  <Text style={styles.meta}>
                    {dayjs(e.startAt).format("h:mm A")}–{dayjs(e.endAt).format("h:mm A")} • {e.tag}
                  </Text>
                </View>

                <Pressable
                  style={[styles.iconBtnPrimary, amHere && styles.iconBtnAlt]}
                  onPress={() => onToggleHereForEvent(e.eventId, label)}
                >
                  <Ionicons
                    name={amHere ? "log-out-outline" : "location-outline"}
                    size={22}
                    color={amHere ? "#111" : "#fff"}
                  />
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20 },
  h1: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 8, color: "#555" },

  card: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  name: { fontSize: 16, fontWeight: "800" },
  meta: { marginTop: 2, color: "#555" },
  small: { color: "#555" },

  outBtn: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  outText: { fontWeight: "900" },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  eventTitle: { fontSize: 16, fontWeight: "900" },

  hereBtn: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  hereBtnText: { color: "white", fontWeight: "900" },

  hereBtnAlt: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  hereBtnTextAlt: { color: "#111" },

  iconBtn: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  iconBtnPrimary: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 999,
  },

  iconBtnAlt: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
});