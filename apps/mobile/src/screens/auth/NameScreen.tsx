import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { saveSession } from "../../state/session";

export default function NameScreen({ navigation }: any) {
  const [name, setName] = useState("");

  const onContinue = () => {
    Alert.alert("Pressed!", "Button press detected ✅");

    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    const fakeUserId = "demo-user-" + Math.floor(Math.random() * 1000000);

    // Save, but don't block navigation if anything is slow
    saveSession({ name: trimmed, userId: fakeUserId }).catch(() => {});

    navigation.reset({
      index: 0,
      routes: [{ name: "Group" }],
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.h1}>Welcome</Text>
      <Text style={styles.sub}>Enter your name to start.</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        style={styles.input}
        autoCapitalize="words"
        returnKeyType="done"
      />

      <View style={{ marginTop: 16 }}>
        <Button title="Continue" onPress={onContinue} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  h1: { fontSize: 32, fontWeight: "800" },
  sub: { marginTop: 8, fontSize: 16, color: "#444" },
  input: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
});