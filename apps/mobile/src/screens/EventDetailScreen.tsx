import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import dayjs from "dayjs";

import { repo, chatRepo, type Event, type Message } from "../repositories";
import { getUserIdOrThrow } from "../state/getUser";
import { getGroupIdOrThrow } from "../state/getGroup";
import { nameForUserId } from "../utils/userNames";

export default function EventDetailScreen({ route, navigation }: any) {
  const routeEventId = route?.params?.eventId ?? route?.params?.id;
  const [event, setEvent] = useState<Event | null>(null);

  const [userId, setUserId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("g1");

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    try {
      const [uid, gid, events] = await Promise.all([
        getUserIdOrThrow(),
        getGroupIdOrThrow(),
        repo.listEvents(),
      ]);

      setUserId(uid);
      setGroupId(gid);

      const found =
        events.find((e: any) => e.eventId === routeEventId || (e as any).id === routeEventId) ||
        null;

      setEvent(found);

      try {
        if (routeEventId) {
          const msgs = await chatRepo.listEventMessages(gid, routeEventId);
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }
    } catch (err) {
      console.log("EventDetail load error:", err);
      setEvent(null);
    }
  };

  useEffect(() => {
    load();
  }, [routeEventId]);

  if (!routeEventId) {
    return (
      <View style={styles.center}>
        <Text style={styles.h1}>Missing event id</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.h1}>Event not found</Text>
        <Text style={styles.small}>Go back and tap the event again.</Text>
        <View style={{ marginTop: 12 }}>
          <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const isDown = event.participantIds.includes(userId);
  const isHere = event.hereIds.includes(userId);

  const onToggleDown = async () => {
    if (!userId) return;

    if (isDown) await repo.leaveEvent(event.eventId, userId);
    else await repo.joinEvent(event.eventId, userId);

    await load();
  };

  const doCheckIn = async () => {
    await repo.checkIn(event.eventId, userId);
    await load();
  };

  const doCheckout = async () => {
    // @ts-ignore demoRepo export
    await repo.checkout(event.eventId, userId);
    await load();
  };

  const onToggleHere = async () => {
    if (!userId) return;

    if (isHere) {
      await doCheckout();
      return;
    }

    // @ts-ignore demoRepo export
    const current = await repo.getCurrentHereEvent(userId);

    if (current && current.eventId !== event.eventId) {
      Alert.alert(
        "Switch location?",
        `You're currently checked in at:\n\n${current.title}${
          current.placeLabel ? ` (${current.placeLabel})` : ""
        }\n\nCheck out and check in here instead?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, switch",
            onPress: async () => {
              await doCheckIn();
            },
          },
        ]
      );
      return;
    }

    await doCheckIn();
  };

  const onPoke = async (toUserId: string) => {
    if (!userId) return;

    await repo.poke(event.eventId, userId, toUserId, "Back to work 😤");
    Alert.alert("Poked!", `Sent a poke to ${nameForUserId(toUserId)} (demo).`);
  };

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    await chatRepo.sendMessage({
      groupId,
      eventId: event.eventId,
      fromUserId: userId,
      text: trimmed,
    });

    setText("");
    await load();
  };

  const downOthers = event.participantIds.filter((id) => id !== userId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>{event.title}</Text>

        <Text style={styles.meta}>
          {dayjs(event.startAt).format("MMM D, h:mm A")} – {dayjs(event.endAt).format("h:mm A")}
        </Text>

        {event.placeLabel ? <Text style={styles.meta}>{event.placeLabel}</Text> : null}
        <Text style={styles.meta}>Tag: {event.tag}</Text>

        <View style={styles.box}>
          <Text style={styles.bold}>Down ({event.participantIds.length})</Text>

          {event.participantIds.map((id) => (
            <View key={id} style={styles.row}>
              <Text style={styles.name}>
                {id === userId ? `${nameForUserId(id)} (you)` : nameForUserId(id)}
              </Text>

              {id !== userId ? (
                <Pressable style={styles.pokeBtn} onPress={() => onPoke(id)}>
                  <Text style={styles.pokeText}>Poke</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.box}>
          <Text style={styles.bold}>Here ({event.hereIds.length})</Text>
          {event.hereIds.length === 0 ? (
            <Text style={styles.small}>No one has checked in yet.</Text>
          ) : (
            event.hereIds.map((id) => (
              <Text key={id} style={styles.small}>
                • {id === userId ? `${nameForUserId(id)} (you)` : nameForUserId(id)}
              </Text>
            ))
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          <Button title={isDown ? "Leave (not down anymore)" : "I'm down ✅"} onPress={onToggleDown} />
        </View>

        <View style={{ marginTop: 10 }}>
          <Button title={isHere ? "Check out (I'm not here)" : "I'm here! 📍"} onPress={onToggleHere} />
        </View>

        {downOthers.length === 0 ? (
          <Text style={styles.tip}>Tip: Ask a friend to join the event so you can poke them.</Text>
        ) : null}

        <View style={styles.chatBox}>
          <Text style={styles.bold}>Messages</Text>

        {messages.length === 0 ? (
        <Text style={styles.small}>No messages yet — start the vibe.</Text>
        ) : (
        messages.map((m) => {
            const mine = m.fromUserId === userId;
            return (
            <View
                key={m.messageId}
                style={{
                alignItems: mine ? "flex-end" : "flex-start",
                marginTop: 10,
                }}
            >
                <View
                style={{
                    maxWidth: "82%",
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 18,
                    backgroundColor: mine ? "#111" : "#f1f1f1",
                }}
                >
                {!mine ? (
                    <Text style={{ fontWeight: "900", marginBottom: 6, color: "#111" }}>
                    {nameForUserId(m.fromUserId)}
                    </Text>
                ) : null}

                <Text style={{ fontSize: 16, fontWeight: "600", color: mine ? "white" : "#111" }}>
                    {m.text}
                </Text>

                <Text
                    style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: "700",
                    color: mine ? "rgba(255,255,255,0.75)" : "#666",
                    }}
                >
                    {dayjs(m.createdAt).format("h:mm A")}
                </Text>
                </View>
            </View>
            );
        })
        )}

          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message..."
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            <Pressable style={styles.sendBtn} onPress={onSend}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Button title="Back" onPress={() => navigation.goBack()} />
        </View>

        {/* padding so last message / input isn't glued to bottom */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, padding: 20, paddingTop: 40 },
  container: { padding: 20, paddingTop: 30 },
  h1: { fontSize: 28, fontWeight: "800" },
  meta: { marginTop: 10, color: "#444", fontSize: 16 },

  box: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },
  bold: { fontWeight: "800", marginBottom: 10, fontSize: 16 },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  name: { fontSize: 16 },

  pokeBtn: {
    backgroundColor: "black",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pokeText: { color: "white", fontWeight: "700" },

  small: { color: "#555", marginTop: 4 },
  tip: { marginTop: 12, color: "#666" },

  chatBox: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },
  msgRow: { marginTop: 10 },
  msgAuthor: { fontWeight: "900" },
  msgText: { marginTop: 2, fontSize: 15 },
  msgTime: { marginTop: 2, color: "#777", fontSize: 12 },

  inputRow: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  sendText: { color: "white", fontWeight: "900" },
});