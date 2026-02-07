import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

export default function CreateEventScreen() {
  const [title, setTitle] = useState("Down to study");
  const [placeLabel, setPlaceLabel] = useState("McLennan Library");

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Create Event</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Down to…"
      />

      <Text style={styles.label}>Place (optional)</Text>
      <TextInput
        value={placeLabel}
        onChangeText={setPlaceLabel}
        style={styles.input}
        placeholder="McLennan Library"
      />

      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Create (API later)</Text>
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
  button: {
    marginTop: 24,
    backgroundColor: "black",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
});