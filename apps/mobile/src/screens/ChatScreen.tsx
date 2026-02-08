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
import { nameForUserId } from "../state/userNames";

type TabKey = "general" | "events";

type ThreadRow = {
  eventId: string;
  title: string;
  placeLabel?: string | null;
  tag?: string;
  lastText: string;
  lastAt: string | null;
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();

  const lastGeneralAtRef = useRef<string | null>(null);
  const generalListRef = useRef<FlatList>(null);

  const [tab, setTab] = useState<TabKey>("general");
  const [userId, setUserId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  const [events, setEvents] = useState<Event[]>([]);
  const [general, setGeneral] = useState<Message[]>([]);
  const [eventsFeed, setEventsFeed] = useState<Message[]>([]);

  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [text, setText] = useState("");

  const scrollGeneralToBottom = (animated: boolean) => {
    setTimeout(() => {
      generalListRef.current?.scrollToEnd({ animated });
    }, 60);
  };

  const buildThreads = (evts: Event[], feed: Message[]): ThreadRow[] => {
    const latestByEvent: Record<string, Message> = {};
    for (const m of feed) {
      if (!m.eventId) continue;
      const existing = latestByEvent[m.eventId];
      if (!existing) latestByEvent[m.eventId] = m;
      else {
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

    rows.sort((a, b) => {
      const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tb - ta;
    });

    return rows;
  };

  const load = useCallback(async () => {
    const [gid, uid, evts] = await Promise.all([
      getGroupIdOrThrow(),
      getUserIdOrThrow(),
      repo.listEvents(),
    ]);

    setGroupId(gid);
    setUserId(uid);
    setEvents(evts);

    const [g, ef] = await Promise.all([
      // IMPORTANT: normal full load
      (chatRepo as any).listGeneralMessages(gid),
      chatRepo.listEventsFeed(gid),
    ]);

    // ensure sorted oldest -> newest
    const sortedG = [...g].sort(
      (a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    setGeneral(sortedG);
    lastGeneralAtRef.current = sortedG.length ? sortedG[sortedG.length - 1].createdAt : null;

    setEventsFeed(ef);
    setThreads(buildThreads(evts, ef));

    if (tab === "general") scrollGeneralToBottom(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSendGeneral = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const [gid, uid] = await Promise.all([getGroupIdOrThrow(), getUserIdOrThrow()]);

    const optimistic: Message = {
      messageId: `tmp-${Date.now()}`,
      groupId: gid,
      eventId: null,
      fromUserId: uid,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setGeneral((prev) => {
      const merged = [...prev, optimistic];
      merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return merged;
    });

    setText("");
    scrollGeneralToBottom(true);

    try {
      const saved = await (chatRepo as any).sendMessage({
        groupId: gid,
        eventId: null,
        text: trimmed,
        fromUserId: uid,
      });

      setGeneral((prev) => {
        const withoutTmp = prev.filter((m) => m.messageId !== optimistic.messageId);
        const merged = [...withoutTmp, saved];
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });

      lastGeneralAtRef.current = saved.createdAt;
      scrollGeneralToBottom(true);
    } catch {
      setGeneral((prev) => prev.filter((m) => m.messageId !== optimistic.messageId));
    }
  };

  // ✅ polling: pulls only messages after lastGeneralAtRef
  useEffect(() => {
    if (tab !== "general") return;
    if (!groupId) return;

    const interval = setInterval(async () => {
      try {
        const since = lastGeneralAtRef.current;
        if (!since) return;

        // IMPORTANT: this must exist in chatRepo (see repo change below)
        const newer: Message[] = await (chatRepo as any).listGeneralMessages(groupId, { since });

        if (newer && newer.length) {
          setGeneral((prev) => {
            const existingIds = new Set(prev.map((m) => m.messageId));
            const merged = [...prev, ...newer.filter((m) => !existingIds.has(m.messageId))];
            merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            return merged;
          });

          lastGeneralAtRef.current = newer[newer.length - 1].createdAt;
          scrollGeneralToBottom(false);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tab, groupId]);

  const renderGeneralBubble = ({ item }: { item: Message }) => {
    const mine = item.fromUserId === userId;
    const time = dayjs(item.createdAt).format("h:mm A");

    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          {!mine ? <Text style={styles.authorTheirs}>{nameForUserId(item.fromUserId)}</Text> : null}
          <Text style={[styles.msg, mine ? styles.msgMine : styles.msgTheirs]}>{item.text}</Text>
          <Text style={[styles.meta, mine ? styles.metaMine : styles.metaTheirs]}>{time}</Text>
        </View>
      </View>
    );
  };

  const renderThread = ({ item }: { item: ThreadRow }) => {
    const time = item.lastAt ? dayjs(item.lastAt).format("h:mm A") : "";
    const subtitleParts: string[] = [];
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Chat</Text>

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
            />
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
    backgroundColor: "#BAF2E9",
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#111" },
  tabText: { fontWeight: "900", color: "#111" },
  tabTextActive: { color: "white" },

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
  sendText: { color: "#BAF2E9", fontWeight: "900" },

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
});