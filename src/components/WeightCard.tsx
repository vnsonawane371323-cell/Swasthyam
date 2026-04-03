import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WeightCard({ data }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🛢 Oil Tracker</Text>

      <Text style={styles.text}>
        Device: {data?.deviceId || "--"}
      </Text>

      <Text style={styles.weight}>
        {data?.weight ? data.weight.toFixed(2) : "--"} g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1d3151",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    color: "orange",
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    color: "white",
  },
  weight: {
    fontSize: 36,
    color: "orange",
    marginTop: 10,
  },
});