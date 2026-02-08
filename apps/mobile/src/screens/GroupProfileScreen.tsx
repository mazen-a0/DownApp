import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Image } from "react-native";
import * as Clipboard from "expo-clipboard";
import { loadSession, saveSession } from "../state/session";
import { pickAndPersistImage } from "../utils/imageStore";

export default function GroupProfileScreen({ navigation }: any) {
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupPhotoUri, setGroupPhotoUri] = useState<string | null>(null);

  const refresh = async () => {
    const s = await loadSession();
    setGroupName(s.groupName || "");
    setInviteCode(s.inviteCode || "");
    setGroupPhotoUri(s.groupPhotoUri || null);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onChangeGroupPhoto = async () => {
    const uri = await pickAndPersistImage("group");
    if (!uri) return;
    await saveSession({ groupPhotoUri: uri });
    await refresh();
  };

  const onSaveName = async () => {
    const trimmed = groupName.trim();
    if (!trimmed) {
      Alert.alert("Group name required", "Please enter a group name.");
      return;
    }
    await saveSession({ groupName: trimmed });
    Alert.alert("Saved", "Group name updated (local).");
  };

  const onCopyCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Copied", `Invite code copied: ${inviteCode}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Group Settings</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Group photo</Text>

        <View style={{ alignItems: "center", marginTop: 10 }}>
          {groupPhotoUri ? (
            <Image source={{ uri: groupPhotoUri }} style={styles.groupPhoto} />
          ) : (
            <View style={[styles.groupPhoto, styles.groupPhotoPlaceholder]}>
              <Text style={{ color: "#777", fontWeight: "800" }}>No photo</Text>
            </View>
          )}

          <Pressable style={styles.linkBtn} onPress={onChangeGroupPhoto}>
            <Text style={styles.linkText}>Change group photo</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Group name</Text>
        <TextInput value={groupName} onChangeText={setGroupName} style={styles.input} />
        <Pressable style={styles.primaryBtn} onPress={onSaveName}>
          <Text style={styles.primaryText}>Save name</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Invite code</Text>
        <Text style={styles.code}>{inviteCode || "—"}</Text>
        <Pressable style={styles.secondaryBtn} onPress={onCopyCode}>
          <Text style={styles.secondaryText}>Copy invite code</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  h1: { fontSize: 28, fontWeight: "900" },

  card: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },

  sectionTitle: { fontSize: 16, fontWeight: "900" },

  groupPhoto: { width: 120, height: 120, borderRadius: 20 },
  groupPhotoPlaceholder: { backgroundColor: "#eee", alignItems: "center", justifyContent: "center" },

  linkBtn: { marginTop: 10 },
  linkText: { fontWeight: "900" },

  input: {
    marginTop: 10,
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
  primaryText: { color: "white", fontWeight: "900" },

  code: { marginTop: 10, fontSize: 22, fontWeight: "900", letterSpacing: 1 },

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#111", fontWeight: "900" },

  backBtn: { marginTop: 20, alignItems: "center" },
  backText: { color: "#666", fontWeight: "800" },
});