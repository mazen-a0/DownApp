import React from "react";
import { View, Text, StyleSheet } from "react-native";
import dayjs from "dayjs";

export default function EventDetailScreen({ route }: any) {
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{event.title}</Text>

      <Text style={styles.meta}>
        {dayjs(event.startAt).format("MMM D, h:mm A")} –{" "}
        {dayjs(event.endAt).format("h:mm A")}
      </Text>

      {event.placeLabel ? <Text style={styles.meta}>{event.placeLabel}</Text> : null}

      <Text style={styles.meta}>Tag: {event.tag}</Text>

      <View style={styles.box}>
        <Text style={styles.bold}>Down</Text>
        <Text>{event.participantIds.length}</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.bold}>Here</Text>
        <Text>{event.hereIds.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 30 },
  h1: { fontSize: 28, fontWeight: "800" },
  meta: { marginTop: 10, color: "#444", fontSize: 16 },
  box: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },
  bold: { fontWeight: "800", marginBottom: 6 },
});