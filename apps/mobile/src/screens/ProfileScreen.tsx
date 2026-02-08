import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { loadSession, clearSession } from "../state/session";
import { api, API_BASE_URL } from "../api/client";

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

  const pingApi = async () => {
    try {
      const res = await api.get("/health");
      Alert.alert("API OK ✅", JSON.stringify(res.data));
    } catch (e: any) {
      const status = e?.response?.status;

      if (status === 404) {
        try {
          const res2 = await api.get("/");
          Alert.alert("API Reachable ✅", JSON.stringify(res2.data).slice(0, 200));
          return;
        } catch (e2: any) {
          const msg2 =
            e2?.response
              ? `${e2.response.status} ${JSON.stringify(e2.response.data)}`
              : e2?.message || "Unknown error";
          Alert.alert("API FAIL ❌", msg2);
          return;
        }
      }

      const msg =
        e?.response
          ? `${e.response.status} ${JSON.stringify(e.response.data)}`
          : e?.message || "Unknown error";
      Alert.alert("API FAIL ❌", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{name || "—"}</Text>

        <Text style={styles.label}>User ID</Text>
        <Text style={styles.value}>{userId || "—"}</Text>

        <Text style={styles.label}>Current Group</Text>
        <Text style={styles.value}>{groupName || "—"}</Text>

        <Text style={styles.label}>Invite Code</Text>
        <Text style={styles.value}>{inviteCode || "—"}</Text>

        <Text style={styles.label}>API Base URL</Text>
        <Text style={styles.value}>{API_BASE_URL}</Text>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("GroupProfile")}>
        <Text style={styles.primaryText}>Group settings</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("Group")}>
        <Text style={styles.secondaryText}>Switch / Join another group</Text>
      </Pressable>

      <Pressable style={styles.pingBtn} onPress={pingApi}>
        <Text style={styles.pingText}>Ping API</Text>
      </Pressable>

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

  primaryBtn: {
    marginTop: 14,
    backgroundColor: "black",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "white", fontWeight: "900" },

  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  secondaryText: { color: "#111", fontWeight: "900" },

  pingBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  pingText: { color: "white", fontWeight: "900" },

  resetBtn: {
    marginTop: 18,
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