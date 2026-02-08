import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { saveSession } from "../../state/session";
import { createGroup, joinGroupByInviteCode } from "../../api/groupsApi";

export default function GroupScreen({ navigation }: any) {
  const [createName, setCreateName] = useState("McGill Squad");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const goToApp = async (groupId: string, groupName: string, inviteCode?: string) => {
    await saveSession({
      groupId,
      groupName,
      inviteCode: inviteCode || null,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs" }],
    });
  };

  const onCreate = async () => {
    const name = createName.trim();
    if (!name) {
      Alert.alert("Group name required", "Enter a group name to create one.");
      return;
    }

    try {
      setLoading(true);

      const group = await createGroup({ name });

      Alert.alert("Group created!", `Invite code: ${group.inviteCode}\n\nShare this with friends.`);
      await goToApp(group.groupId, group.name, group.inviteCode);
    } catch (e: any) {
      const msg =
        e?.response ? `${e.response.status}: ${JSON.stringify(e.response.data)}` : e?.message;
      Alert.alert("Create failed", msg || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Invite code required", "Enter the invite code to join.");
      return;
    }

    try {
      setLoading(true);

      const group = await joinGroupByInviteCode({ inviteCode: code });

      Alert.alert("Joined!", `You joined ${group.name}.`);
      await goToApp(group.groupId, group.name, group.inviteCode);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        Alert.alert("Invalid code", "No group found for that invite code.");
        return;
      }

      const msg =
        e?.response ? `${e.response.status}: ${JSON.stringify(e.response.data)}` : e?.message;
      Alert.alert("Join failed", msg || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Group</Text>
      <Text style={styles.sub}>Create a friend group or join using an invite code.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create a group</Text>
        <TextInput
          value={createName}
          onChangeText={setCreateName}
          placeholder="Group name"
          style={styles.input}
        />
        <Pressable style={styles.primaryBtn} onPress={onCreate} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? "Creating..." : "Create"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Join a group</Text>
        <TextInput
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="Invite code (e.g. DD2010)"
          autoCapitalize="characters"
          style={styles.input}
        />
        <Pressable style={styles.secondaryBtn} onPress={onJoin} disabled={loading}>
          <Text style={styles.secondaryText}>{loading ? "Joining..." : "Join"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  h1: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 8, color: "#555" },

  card: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: "black",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "white", fontWeight: "800" },

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#111", fontWeight: "800" },
});