// app/(tabs)/home.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
// Optional: to add a manual link/button
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>

      {/* If you want an inline button to go to the Map tab */}
      <Link href="/map/index">
        Go to Map
      </Link>
      <Link href="/(tabs)/square">
        Go to Square
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  link: {
    fontSize: 18,
    color: "blue",
    marginTop: 8,
    textDecorationLine: "underline",
  },
});