// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: () => null /* add icon here if you like */ }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: "Map", tabBarIcon: () => null /* add icon here if you like */ }}
      />
    </Tabs>
  );
}