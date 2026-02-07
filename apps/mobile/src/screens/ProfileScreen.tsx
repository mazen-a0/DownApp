import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { loadSession, saveSession, clearSession } from "../state/session";

const DEMO_USERS = [
  { name: "Amir", userId: "u1" },
  { name: "Ishita", userId: "u2" },
  { name: "Evan", userId: "u3" },
];

export default function ProfileScreen({ navigation }: any) {
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const refresh = async () => {
    const s = await loadSession();
    setName(s.name);
    setUserId(s.userId);
    setGroupName(s.groupName);
    setInviteCode(s.inviteCode);
  };

  useEffect(() => {
    refresh();
  }, []);

  const switchUser = async (u: { name: string; userId: string }) => {
    await saveSession({ name: u.name, userId: u.userId });
    await refresh();
    Alert.alert("Switched!", `You are now ${u.name} (demo).`);
  };

  const resetApp = async () => {
    Alert.alert(
      "Reset app?",
      "This will clear your saved session and return to onboarding.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearSession();
            navigation.reset({ index: 0, routes: [{ name: "Name" }] });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{name || "—"}</Text>

        <Text style={styles.label}>User ID</Text>
        <Text style={styles.value}>{userId || "—"}</Text>

        <Text style={styles.label}>Group</Text>
        <Text style={styles.value}>{groupName || "—"}</Text>

        <Text style={styles.label}>Invite Code</Text>
        <Text style={styles.value}>{inviteCode || "—"}</Text>
      </View>

      <Text style={styles.sectionTitle}>Switch demo user</Text>
      <View style={styles.row}>
        {DEMO_USERS.map((u) => (
          <Pressable key={u.userId} style={styles.pill} onPress={() => switchUser(u)}>
            <Text style={styles.pillText}>{u.name}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.resetBtn} onPress={resetApp}>
        <Text style={styles.resetText}>Reset app</Text>
      </Pressable>

      <Pressable style={styles.refreshBtn} onPress={refresh}>
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  h1: { fontSize: 28, fontWeight: "800" },

  card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },

  label: { marginTop: 10, fontSize: 13, color: "#666", fontWeight: "700" },
  value: { marginTop: 4, fontSize: 16, fontWeight: "700", color: "#111" },

  sectionTitle: { marginTop: 22, fontSize: 16, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },

  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "white",
  },
  pillText: { fontWeight: "800" },

  resetBtn: {
    marginTop: 24,
    backgroundColor: "#ffefef",
    borderWidth: 1,
    borderColor: "#ffcccc",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  resetText: { fontWeight: "900", color: "#b00020" },

  refreshBtn: { marginTop: 12, alignItems: "center" },
  refreshText: { color: "#666", fontWeight: "800" },
});