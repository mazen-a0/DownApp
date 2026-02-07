import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { saveSession } from "../../state/session";

export default function GroupScreen({ navigation }: any) {
  const [groupName, setGroupName] = useState("");

  const skipDemo = async () => {
    // temporary fake group data so Boot will send you to Tabs
    const fakeGroupId = "demo-group-" + Math.floor(Math.random() * 1000000);
    await saveSession({ groupId: fakeGroupId, groupName: "Demo Group" });

    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Group Setup</Text>
      <Text style={styles.sub}>
        For now we’ll keep this simple. Later this becomes Create/Join by invite code.
      </Text>

      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        placeholder="Group name (optional for now)"
        style={styles.input}
      />

      <View style={{ marginTop: 12 }}>
        <Button
          title="Skip (demo) → Go to app"
          onPress={skipDemo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  h1: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 8, fontSize: 15, color: "#444" },
  input: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
});