import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { loadSession, saveSession } from "../state/session";
import { pickAndPersistImage } from "../utils/imageStore";
import { fetchGroup, updateGroupName, listMyGroups, type GroupDto } from "../api/groupsApi";

export default function GroupProfileScreen({ navigation }: any) {
  const [groupId, setGroupId] = useState<string | null>(null);

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupPhotoUri, setGroupPhotoUri] = useState<string | null>(null);

  const [myGroups, setMyGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const refresh = async () => {
    const s = await loadSession();
    setGroupId(s.groupId);
    setGroupPhotoUri(s.groupPhotoUri || null);

    try {
      setLoading(true);

      // 1) Load my groups (for switching UI)
      const groups = await listMyGroups();
      setMyGroups(groups);

      // 2) Load current group details
      if (s.groupId) {
        const g = await fetchGroup(s.groupId);

        setGroupName(g.name || "");
        setInviteCode(g.inviteCode || "");

        // Keep session in sync
        await saveSession({
          groupId: g.groupId,
          groupName: g.name,
          inviteCode: g.inviteCode,
        });
      } else {
        // fallback to local if no selected group
        setGroupName(s.groupName || "");
        setInviteCode(s.inviteCode || "");
      }
    } catch (e: any) {
      // fallback to local session if server fails
      setGroupName(s.groupName || "");
      setInviteCode(s.inviteCode || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onChangeGroupPhoto = async () => {
    const uri = await pickAndPersistImage("group");
    if (!uri) return;
    await saveSession({ groupPhotoUri: uri });
    setGroupPhotoUri(uri);
  };

  const onSaveName = async () => {
    const trimmed = groupName.trim();
    if (!trimmed) {
      Alert.alert("Group name required", "Please enter a group name.");
      return;
    }

    if (!groupId) {
      Alert.alert("No group selected", "You don’t have a current group selected.");
      return;
    }

    try {
      setLoading(true);
      const g = await updateGroupName(groupId, trimmed);

      setGroupName(g.name || "");
      setInviteCode(g.inviteCode || "");

      await saveSession({
        groupName: g.name,
        inviteCode: g.inviteCode,
      });

      Alert.alert("Saved", "Group name updated.");
    } catch (e: any) {
      const msg =
        e?.response ? `${e.response.status}: ${JSON.stringify(e.response.data)}` : e?.message;
      Alert.alert("Update failed", msg || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onCopyCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Copied", `Invite code copied: ${inviteCode}`);
  };

  const onSwitchGroup = async (g: GroupDto) => {
    if (!g?.groupId) return;
    if (g.groupId === groupId) return;

    try {
      setSwitching(true);

      await saveSession({
        groupId: g.groupId,
        groupName: g.name,
        inviteCode: g.inviteCode,
      });

      setGroupId(g.groupId);
      setGroupName(g.name || "");
      setInviteCode(g.inviteCode || "");

      // optional fresh fetch
      try {
        const fresh = await fetchGroup(g.groupId);
        setGroupName(fresh.name || "");
        setInviteCode(fresh.inviteCode || "");
        await saveSession({ groupName: fresh.name, inviteCode: fresh.inviteCode });
      } catch {}

      // ✅ Tell the rest of the app to refresh
      navigation.getParent()?.emit({ type: "groupChanged", data: { groupId: g.groupId } });

      // ✅ Leave settings screen (feels natural)
      navigation.goBack();

      Alert.alert("Switched group", `You are now in ${g.name}.`);
    } finally {
      setSwitching(false);
    }
  };

  // If current group isn't in myGroups (can happen), still show it at top
  const currentShownInList = groupId && myGroups.some((x) => x.groupId === groupId);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
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
        <Pressable style={styles.primaryBtn} onPress={onSaveName} disabled={loading || switching}>
          <Text style={styles.primaryText}>
            {switching ? "Switching..." : loading ? "Saving..." : "Save name"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Invite code</Text>
        <Text style={styles.code}>{inviteCode || "—"}</Text>
        <Pressable style={styles.secondaryBtn} onPress={onCopyCode} disabled={switching}>
          <Text style={styles.secondaryText}>Copy invite code</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Switch groups</Text>

        {switching ? <Text style={styles.small}>Switching…</Text> : null}

        {loading && myGroups.length === 0 ? (
          <Text style={styles.small}>Loading your groups…</Text>
        ) : myGroups.length === 0 ? (
          <Text style={styles.small}>You aren’t in any groups yet.</Text>
        ) : (
          <>
            {!currentShownInList && groupId ? (
              <View style={[styles.groupRow, styles.groupRowActive]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupRowTitle}>{groupName || "Current group"}</Text>
                  <Text style={styles.groupRowMeta}>Invite code: {inviteCode || "—"}</Text>
                </View>
                <Text style={styles.groupRowChip}>Current</Text>
              </View>
            ) : null}

            {myGroups.map((g) => {
              const active = g.groupId === groupId;
              return (
                <Pressable
                  key={g.groupId}
                  style={[styles.groupRow, active && styles.groupRowActive]}
                  onPress={() => onSwitchGroup(g)}
                  disabled={switching}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.groupRowTitle, active && styles.groupRowTitleActive]}>
                      {g.name}
                    </Text>
                    <Text style={[styles.groupRowMeta, active && styles.groupRowMetaActive]}>
                      Invite code: {g.inviteCode}
                    </Text>
                  </View>
                  <Text style={[styles.groupRowChip, active && styles.groupRowChipActive]}>
                    {active ? "Current" : "Switch"}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )}

        <Pressable
          style={styles.linkBtn}
          onPress={() => navigation.navigate("Group")}
          disabled={switching}
        >
          <Text style={styles.linkText}>Join / create another group</Text>
        </Pressable>

        <Pressable style={styles.linkBtn} onPress={refresh} disabled={switching}>
          <Text style={styles.linkText}>Refresh</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} disabled={switching}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40 },
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

  linkBtn: { marginTop: 12 },
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

  small: { marginTop: 10, color: "#555", fontWeight: "700" },

  groupRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "white",
  },
  groupRowActive: {
    borderColor: "#111",
  },
  groupRowTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  groupRowTitleActive: { color: "#111" },
  groupRowMeta: { marginTop: 4, color: "#666", fontWeight: "700" },
  groupRowMetaActive: { color: "#666" },

  groupRowChip: { fontWeight: "900", color: "#111" },
  groupRowChipActive: { fontWeight: "900", color: "#111" },

  backBtn: { marginTop: 20, alignItems: "center" },
  backText: { color: "#666", fontWeight: "800" },
});