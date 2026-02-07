import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import dayjs from "dayjs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { chatRepo, repo, Message, Event } from "../repositories";
import { getGroupIdOrThrow } from "../state/getGroup";
import { getUserIdOrThrow } from "../state/getUser";
import { nameForUserId } from "../utils/userNames";

type TabKey = "general" | "events";

export default function ChatScreen() {
  const navigation = useNavigation<any>();

  const [tab, setTab] = useState<TabKey>("general");
  const [userId, setUserId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("g1");

  const [events, setEvents] = useState<Event[]>([]);

  const [general, setGeneral] = useState<Message[]>([]);
  const [eventsFeed, setEventsFeed] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const listRef = useRef<FlatList>(null);

  const load = async () => {
    const [gid, uid, evts] = await Promise.all([
      getGroupIdOrThrow(),
      getUserIdOrThrow(),
      repo.listEvents(),
    ]);

    setGroupId(gid);
    setUserId(uid);
    setEvents(evts);

    const [g, ef] = await Promise.all([
      chatRepo.listGeneralMessages(gid),
      chatRepo.listEventsFeed(gid),
    ]);

    setGeneral(g);
    setEventsFeed(ef);
  };

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const eventTitleFor = useCallback(
    (eventId?: string | null) => {
      if (!eventId) return null;
      return events.find((e) => e.eventId === eventId)?.title || "Event";
    },
    [events]
  );

  const onSendGeneral = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    await chatRepo.sendMessage({
      groupId,
      eventId: null,
      fromUserId: userId,
      text: trimmed,
    });

    setText("");
    await load();

    // scroll to bottom of general chat after sending
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const data = tab === "general" ? general : eventsFeed;

  const renderBubble = ({ item }: { item: Message }) => {
    const mine = item.fromUserId === userId;
    const time = dayjs(item.createdAt).format("h:mm A");

    if (tab === "events") {
      // FEED: show event label + tap to open event
      const eventTitle = eventTitleFor(item.eventId);
      return (
        <Pressable
          onPress={() => {
            if (item.eventId) navigation.navigate("EventDetail", { eventId: item.eventId });
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
            <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.author, mine ? styles.authorMine : styles.authorTheirs]}>
                {mine ? "You" : nameForUserId(item.fromUserId)}
              </Text>

              <Text style={[styles.msg, mine ? styles.msgMine : styles.msgTheirs]}>{item.text}</Text>

              <View style={styles.metaRow}>
                <Text style={[styles.meta, mine ? styles.metaMine : styles.metaTheirs]}>{time}</Text>
                {eventTitle ? (
                  <Text style={[styles.meta, mine ? styles.metaMine : styles.metaTheirs]}>
                    {"  "}•{"  "}In: {eventTitle}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>
      );
    }

    // GENERAL: iMessage style
    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          {!mine ? (
            <Text style={styles.authorTheirs}>{nameForUserId(item.fromUserId)}</Text>
          ) : null}

          <Text style={[styles.msg, mine ? styles.msgMine : styles.msgTheirs]}>{item.text}</Text>

          <Text style={[styles.meta, mine ? styles.metaMine : styles.metaTheirs]}>{time}</Text>
        </View>
      </View>
    );
  };

  // On tab switch, try to show the latest stuff (bottom for general, top for feed)
  useEffect(() => {
    setTimeout(() => {
      if (tab === "general") listRef.current?.scrollToEnd({ animated: false });
      else listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  }, [tab]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.h1}>Chat</Text>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setTab("general")}
            style={[styles.tabBtn, tab === "general" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === "general" && styles.tabTextActive]}>General</Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("events")}
            style={[styles.tabBtn, tab === "events" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === "events" && styles.tabTextActive]}>Events</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(m) => m.messageId}
          renderItem={renderBubble}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: tab === "general" ? 12 : 24 }}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ padding: 16 }}>
              <Text style={{ color: "#666", fontWeight: "700" }}>
                No messages yet. Send one to start the chat.
              </Text>
            </View>
          }
        />

        {/* Input ONLY for General */}
        {tab === "general" ? (
          <View style={styles.inputWrap}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message…"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={onSendGeneral}
            />
            <Pressable style={styles.sendBtn} onPress={onSendGeneral}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.feedHint}>
            <Text style={styles.feedHintText}>
              This is a feed of event chats. Tap a message to open the event.
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20 },
  h1: { fontSize: 28, fontWeight: "800" },

  tabBar: {
    marginTop: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#111" },
  tabText: { fontWeight: "900", color: "#111" },
  tabTextActive: { color: "white" },

  row: { width: "100%", marginVertical: 6, paddingHorizontal: 2 },
  rowMine: { alignItems: "flex-end" },
  rowTheirs: { alignItems: "flex-start" },

  bubble: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  bubbleMine: { backgroundColor: "#111" },
  bubbleTheirs: { backgroundColor: "#f1f1f1" },

  author: { fontWeight: "900", marginBottom: 6 },
  authorMine: { color: "white" },
  authorTheirs: { color: "#111", fontWeight: "900", marginBottom: 6 },

  msg: { fontSize: 16, fontWeight: "600" },
  msgMine: { color: "white" },
  msgTheirs: { color: "#111" },

  metaRow: { flexDirection: "row", marginTop: 8, flexWrap: "wrap" },
  meta: { marginTop: 8, fontSize: 12, fontWeight: "700" },
  metaMine: { color: "rgba(255,255,255,0.75)" },
  metaTheirs: { color: "#666" },

  inputWrap: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "white",
  },
  sendBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  sendText: { color: "white", fontWeight: "900" },

  feedHint: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  feedHintText: { color: "#666", fontWeight: "700" },
});