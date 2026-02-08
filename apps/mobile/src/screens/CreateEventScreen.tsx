import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dayjs from "dayjs";

import { repo, type EventTag } from "../repositories";
import { getUserIdOrThrow } from "../state/getUser";

const TAGS: EventTag[] = ["study", "library", "food", "bar", "club", "stay_in", "gym", "other"];

export default function CreateEventScreen({ navigation }: any) {
  const [title, setTitle] = useState("Down to study");
  const [placeLabel, setPlaceLabel] = useState("McLennan Library");
  const [tag, setTag] = useState<EventTag>("study");

  const onCreate = async () => {
    try {
      const uid = await getUserIdOrThrow();

      const startAt = dayjs().add(1, "hour").toISOString();
      const endAt = dayjs().add(2, "hour").toISOString();

      await repo.createEvent(
        {
          title: title.trim() || "Down",
          tag,
          startAt,
          endAt,
          placeLabel: placeLabel.trim() || undefined,
        },
        uid
      );

      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create event");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Create Event</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Place (optional)</Text>
      <TextInput value={placeLabel} onChangeText={setPlaceLabel} style={styles.input} />

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
});