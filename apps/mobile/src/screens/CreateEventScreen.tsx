import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from "react-native";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";

import { repo, type EventTag } from "../repositories";

const TAGS: EventTag[] = ["study", "library", "food", "bar", "club", "stay_in", "gym", "other"];

// Keep it small for MVP — you can expand later
const EMOJIS = ["📚", "☕️", "🍔", "🍻", "🕺", "🏠", "🏋️", "🎮", "🧠", "📌", "🍃"];

type Picking = "start" | "end" | null;

export default function CreateEventScreen({ navigation }: any) {
  const [title, setTitle] = useState("Down to study");
  const [placeLabel, setPlaceLabel] = useState("McLennan Library");
  const [tag, setTag] = useState<EventTag>("study");

  // ✅ Emoji "event profile picture"
  const [emoji, setEmoji] = useState<string>("📚");

  // ✅ Times: default start = now + 1h, end = start + 1h
  const [startAt, setStartAt] = useState<Date>(dayjs().add(1, "hour").toDate());
  const [endAt, setEndAt] = useState<Date>(dayjs().add(2, "hour").toDate());

  // ✅ iOS-friendly picker flow with Done/Cancel
  const [picking, setPicking] = useState<Picking>(null);
  const [tempTime, setTempTime] = useState<Date>(startAt);

  const startLabel = useMemo(() => dayjs(startAt).format("h:mm A"), [startAt]);
  const endLabel = useMemo(() => dayjs(endAt).format("h:mm A"), [endAt]);

  const openStartPicker = () => {
    setTempTime(startAt);
    setPicking("start");
  };

  const openEndPicker = () => {
    setTempTime(endAt);
    setPicking("end");
  };

  const closePicker = () => setPicking(null);

  const onDonePicker = () => {
    if (picking === "start") {
      const nextStart = tempTime;
      setStartAt(nextStart);

      // keep end >= start + 30m (nice UX)
      const minEndMs = nextStart.getTime() + 30 * 60 * 1000;
      if (endAt.getTime() < minEndMs) {
        setEndAt(new Date(nextStart.getTime() + 60 * 60 * 1000));
      }
    } else if (picking === "end") {
      setEndAt(tempTime);
    }

    closePicker();
  };

  // Android can keep the old behavior (tap -> picker -> auto closes)
  const onAndroidChange = (_e: any, selected?: Date) => {
    if (!selected) return;

    if (picking === "start") {
      setPicking(null);
      setStartAt(selected);

      const minEnd = new Date(selected.getTime() + 30 * 60 * 1000);
      if (endAt.getTime() < minEnd.getTime()) {
        setEndAt(new Date(selected.getTime() + 60 * 60 * 1000));
      }
    }

    if (picking === "end") {
      setPicking(null);
      setEndAt(selected);
    }
  };

  const onCreate = async () => {
    try {
      const trimmedTitle = title.trim() || "Down";

      if (endAt.getTime() <= startAt.getTime()) {
        Alert.alert("Invalid time", "End time must be after start time.");
        return;
      }

      await repo.createEvent({
        title: trimmedTitle,
        tag,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        placeLabel: placeLabel.trim() || undefined,
        emoji,
      });

      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response
        ? `${e.response.status}: ${JSON.stringify(e.response.data)}`
        : e?.message;
      Alert.alert("Error", msg || "Failed to create event");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Create Event</Text>

      <Text style={styles.label}>Event emoji</Text>
      <View style={styles.emojiRow}>
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            style={[styles.emojiPill, emoji === e && styles.emojiPillActive]}
          >
            <Text style={styles.emojiText}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Place (optional)</Text>
      <TextInput value={placeLabel} onChangeText={setPlaceLabel} style={styles.input} />

      <Text style={styles.label}>Time</Text>
      <View style={styles.timeRow}>
        <Pressable
          style={styles.timeBtn}
          onPress={() => {
            if (Platform.OS === "android") setPicking("start");
            else openStartPicker();
          }}
        >
          <Text style={styles.timeBtnText}>Start: {startLabel}</Text>
        </Pressable>

        <Pressable
          style={styles.timeBtn}
          onPress={() => {
            if (Platform.OS === "android") setPicking("end");
            else openEndPicker();
          }}
        >
          <Text style={styles.timeBtnText}>End: {endLabel}</Text>
        </Pressable>
      </View>

      {/* ✅ ANDROID: inline picker auto-closes */}
      {Platform.OS === "android" && picking ? (
        <DateTimePicker
          value={picking === "start" ? startAt : endAt}
          mode="time"
          display="default"
          onChange={onAndroidChange}
        />
      ) : null}

      {/* ✅ IOS: Modal with Cancel/Done */}
      {Platform.OS === "ios" ? (
        <Modal visible={!!picking} transparent animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={closePicker} />

          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {picking === "start" ? "Select start time" : "Select end time"}
            </Text>

            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={(_e, selected) => {
                if (selected) setTempTime(selected);
              }}
            />

            <View style={styles.modalBtns}>
              <Pressable style={styles.modalBtn} onPress={closePicker}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>

              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={onDonePicker}>
                <Text style={[styles.modalBtnText, styles.modalBtnTextPrimary]}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}

      <Text style={styles.label}>Tag</Text>
      <View style={styles.tagsRow}>
        {TAGS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTag(t)}
            style={[styles.tagPill, tag === t && styles.tagPillActive]}
          >
            <Text style={[styles.tagText, tag === t && styles.tagTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.button} onPress={onCreate}>
        <Text style={styles.buttonText}>Create</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  h1: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  label: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiPill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "white",
  },
  emojiPillActive: { backgroundColor: "#111", borderColor: "#111" },
  emojiText: { fontSize: 18 },

  timeRow: { flexDirection: "row", gap: 10 },
  timeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  timeBtnText: { fontWeight: "700" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagPill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  tagPillActive: { backgroundColor: "black", borderColor: "black" },
  tagText: { color: "#222", fontWeight: "600" },
  tagTextActive: { color: "white" },

  button: {
    marginTop: 24,
    backgroundColor: "black",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },

  // ✅ iOS modal picker
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalBtnPrimary: { backgroundColor: "#111", borderColor: "#111" },
  modalBtnText: { fontWeight: "800" },
  modalBtnTextPrimary: { color: "white" },
});