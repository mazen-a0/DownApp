import React, { useCallback, useEffect, useRef, useState } from "react";
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

type ThreadRow = {
  eventId: string;
  title: string;
  placeLabel?: string | null;
  tag?: string;
  lastText: string;
  lastAt: string | null; // ISO or null
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();

  const [tab, setTab] = useState<TabKey>("general");
  const [userId, setUserId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("g1");

  const [events, setEvents] = useState<Event[]>([]);
  const [general, setGeneral] = useState<Message[]>([]);
  const [eventsFeed, setEventsFeed] = useState<Message[]>([]);

  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [text, setText] = useState("");

  const generalListRef = useRef<FlatList>(null);

  const buildThreads = (evts: Event[], feed: Message[]): ThreadRow[] => {
    // latest message per event
    const latestByEvent: Record<string, Message> = {};
    for (const m of feed) {
      if (!m.eventId) continue;
      const existing = latestByEvent[m.eventId];
      if (!existing) {
        latestByEvent[m.eventId] = m;
      } else {
        const a = new Date(existing.createdAt).getTime();
        const b = new Date(m.createdAt).getTime();
        if (b > a) latestByEvent[m.eventId] = m;
      }
    }

    const rows: ThreadRow[] = evts.map((e) => {
      const latest = latestByEvent[e.eventId];
      return {
        eventId: e.eventId,
        title: e.title,
        placeLabel: e.placeLabel ?? null,
        tag: (e as any).tag,
        lastText: latest ? latest.text : "No messages yet",
        lastAt: latest ? latest.createdAt : null,
      };
    });

    // Sort threads: most recent message first; if no message, push lower
    rows.sort((a, b) => {
      const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tb - ta;
    });

    return rows;
  };

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
    setThreads(buildThreads(evts, ef));

    // When general loads, scroll to bottom like iMessage
    setTimeout(() => {
      if (tab === "general") generalListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  };

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
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

    setTimeout(() => {
      generalListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const renderGeneralBubble = ({ item }: { item: Message }) => {
    const mine = item.fromUserId === userId;
    const time = dayjs(item.createdAt).format("h:mm A");

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

  const renderThread = ({ item }: { item: ThreadRow }) => {
    const time = item.lastAt ? dayjs(item.lastAt).format("h:mm A") : "";
    const subtitleParts = [];
    if (item.placeLabel) subtitleParts.push(item.placeLabel);
    if (item.tag) subtitleParts.push(item.tag);
    const subtitle = subtitleParts.join(" • ");

    return (
      <Pressable
        onPress={() => navigation.navigate("EventDetail", { eventId: item.eventId })}
        style={({ pressed }) => [styles.threadRow, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.threadAvatar}>
          <Text style={styles.threadAvatarText}>{(item.title || "E")[0].toUpperCase()}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.threadTop}>
            <Text style={styles.threadTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {time ? <Text style={styles.threadTime}>{time}</Text> : null}
          </View>

          {subtitle ? (
            <Text style={styles.threadSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}

          <Text style={styles.threadPreview} numberOfLines={1}>
            {item.lastText}
          </Text>
        </View>
      </Pressable>
    );
  };

  // On tab switch, make general behave like a chat (bottom), events like list (top)
  useEffect(() => {
    setTimeout(() => {
      if (tab === "general") generalListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, [tab]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
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

        {/* Content */}
        {tab === "general" ? (
          <>
            <FlatList
              ref={generalListRef}
              data={general}
              keyExtractor={(m) => m.messageId}
              renderItem={renderGeneralBubble}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 12, paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ padding: 16 }}>
                  <Text style={{ color: "#666", fontWeight: "700" }}>
                    No messages yet. Send one to start the group chat.
                  </Text>
                </View>
              }
            />

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
          </>
        ) : (
          <>
            <FlatList
              data={threads}
              keyExtractor={(t) => t.eventId}
              renderItem={renderThread}
              style={{ flex: 1, marginTop: 8 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ padding: 16 }}>
                  <Text style={{ color: "#666", fontWeight: "700" }}>
                    No events yet. Create an event to start an event chat.
                  </Text>
                </View>
              }
            />

            <View style={styles.feedHint}>
              <Text style={styles.feedHintText}>
                Tap an event to open its chat.
              </Text>
            </View>
          </>
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

  // General chat bubbles
  row: { width: "100%", marginVertical: 6, paddingHorizontal: 2 },
  rowMine: { alignItems: "flex-end" },
  rowTheirs: { alignItems: "flex-start" },
  bubble: { maxWidth: "80%", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 18 },
  bubbleMine: { backgroundColor: "#111" },
  bubbleTheirs: { backgroundColor: "#f1f1f1" },
  authorTheirs: { color: "#111", fontWeight: "900", marginBottom: 6 },
  msg: { fontSize: 16, fontWeight: "600" },
  msgMine: { color: "white" },
  msgTheirs: { color: "#111" },
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

  // Events thread list (IG DM style)
  threadRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  threadAvatarText: { color: "white", fontWeight: "900", fontSize: 16 },
  threadTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  threadTitle: { fontWeight: "900", fontSize: 16, flex: 1 },
  threadTime: { color: "#666", fontWeight: "800", fontSize: 12 },
  threadSubtitle: { marginTop: 2, color: "#666", fontWeight: "700", fontSize: 12 },
  threadPreview: { marginTop: 4, color: "#444", fontWeight: "700" },

  feedHint: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  feedHintText: { color: "#666", fontWeight: "700" },
});