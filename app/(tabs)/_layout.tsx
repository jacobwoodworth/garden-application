// app/tabs/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="home" 
        options={{ title: 'Home', tabBarIcon: () => null /* You can add an icon here */ }}
      />
      {/* You can add more tab screens here */}
    </Tabs>
  );
}