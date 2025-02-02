import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Define menuItems and their route paths explicitly
const menuItems = [
  { name: "Profile", route: "/profile" },
  { name: "Leaderboard", route: "/leaderboard" },
  { name: "My Plants", route: "/plants" },
  { name: "Map", route : "/map" },
] as const; // 'as const' ensures the route is typed correctly

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={{ position: "absolute", top: "7%", left: "10%", width: "25%", backgroundColor: isOpen ? "#51631f" : "transparent", padding: 10 }}>
        <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={{ padding: 10, backgroundColor: "#84ab55" }}>
          <Text style={{ color: "#fff" }}>{isOpen ? "Close" : "Menu"}</Text>
        </TouchableOpacity>
        {isOpen && (
          <View>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={{ padding: 5 }}
                onPress={() => router.push(item.route)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default Sidebar;

