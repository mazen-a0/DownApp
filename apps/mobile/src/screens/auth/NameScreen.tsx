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
  ActivityIndicator,
} from "react-native";
import { saveSession, loadSession } from "../../state/session";
import { upsertUser } from "../../api/usersApi";
import { getOrCreateDeviceId } from "../../state/device";
import { setUserIdHeader } from "../../api/client";
import { registerForPushNotifications } from "../../utils/pushNotifications";

export default function NameScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }
    if (loading) return;

    setLoading(true);

    try {
      // 1) stable device id
      const deviceId = await getOrCreateDeviceId();

      // NEW: 2) Get push token
    const pushToken = await registerForPushNotifications();
    if (pushToken) {
      console.log('📱 Got push token:', pushToken);
    }

      // 3) upsert user in DB (idempotent)
      const { userId } = await upsertUser({
        name: trimmed,
        deviceId,
        pushToken,
      });

      // 4) set axios header for everything else
      setUserIdHeader(userId);

      // 5) persist session
      await saveSession({ 
        name: trimmed, 
        userId,
        pushToken
      });

      // 6) route based on whether they already have a group
      const s = await loadSession();
      navigation.reset({
        index: 0,
        routes: [{ name: s.groupId ? "Tabs" : "Group" }],
      });
    } catch (e: any) {
      const msg = e?.response
        ? `${e.response.status}: ${JSON.stringify(e.response.data)}`
        : e?.message;
      Alert.alert("User create failed", msg || "Unknown error");
    } finally {
      setLoading(false);
    }
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
        editable={!loading}
        onSubmitEditing={onContinue}
      />

      <View style={{ marginTop: 16 }}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Creating profile…</Text>
          </View>
        ) : (
          <Button title="Continue" onPress={onContinue} />
        )}
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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: { color: "#555", fontWeight: "700" },
});