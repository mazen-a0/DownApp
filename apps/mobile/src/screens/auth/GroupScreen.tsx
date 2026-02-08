import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { saveSession } from "../../state/session";
import { groupRepo } from "../../repositories";

export default function GroupScreen({ navigation }: any) {
  const [createName, setCreateName] = useState("McGill Squad");
  const [joinCode, setJoinCode] = useState("BOUTH3");

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

    const group = await groupRepo.createGroup(name);

    Alert.alert(
      "Group created!",
      `Invite code: ${group.inviteCode}\n\nShare this with friends.`
    );

    await goToApp(group.groupId, group.name, group.inviteCode);
  };

  const onJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Invite code required", "Enter the invite code to join.");
      return;
    }

    const group = await groupRepo.joinGroupByCode(code);

    if (!group) {
      Alert.alert("Invalid code", "No group found for that invite code (demo).");
      return;
    }

    await goToApp(group.groupId, group.name, group.inviteCode);
  };

  const skipDemo = async () => {
    // fallback if you want to jump in without typing
    await goToApp("demo-group", "Demo Group", "DEMO00");
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
        <Pressable style={styles.primaryBtn} onPress={onCreate}>
          <Text style={styles.primaryText}>Create</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Join a group</Text>
        <TextInput
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="Invite code (e.g. BOUTH3)"
          autoCapitalize="characters"
          style={styles.input}
        />
        <Pressable style={styles.secondaryBtn} onPress={onJoin}>
          <Text style={styles.secondaryText}>Join</Text>
        </Pressable>
      </View>

      <Pressable style={styles.skipBtn} onPress={skipDemo}>
        <Text style={styles.skipText}>Skip (demo)</Text>
      </Pressable>
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

  skipBtn: { marginTop: 18, alignItems: "center" },
  skipText: { color: "#666", fontWeight: "700" },
});