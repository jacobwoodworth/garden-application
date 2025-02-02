import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Sidebar from "./sidebar"; // Import the Sidebar component
import { useRouter, usePathname } from "expo-router"; // Import useRouter and usePathname from expo-router

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const router = useRouter(); // Get the router instance
  const pathname = usePathname(); // Get the current pathname

  return (
    <View style={styles.container}>
      {/* Wrap Sidebar in a View with specific width */}
      <View style={styles.sidebarContainer}>
        <Sidebar />
      </View>
      <View style={styles.content}>
        {/* Dynamically render content based on the current route */}
        {pathname === "/homeScreenDummy1" && (
          <View style={styles.screenContainer}>
            <Text style={styles.title}>Profile Screen</Text>
          </View>
        )}
        {pathname === "/homeScreenDummy2" && (
          <View style={styles.screenContainer}>
            <Text style={styles.title}>My Garden Screen</Text>
          </View>
        )}
        {pathname === "/homeScreenDummy3" && (
          <View style={styles.screenContainer}>
            <Text style={styles.title}>All Plants Screen</Text>
          </View>
        )}
        {pathname === "/homeScreenDummy4" && (
          <View style={styles.screenContainer}>
            <Text style={styles.title}>Leaderboard Screen</Text>
          </View>
        )}
        {pathname === "/homeScreenDummy5" && (
          <View style={styles.screenContainer}>
            <Text style={styles.title}>Map Screen</Text>
          </View>
        )}
        {children} {/* Render children passed to Layout */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: "row", // Sidebar and content side by side
      flex: 1,
    },
    sidebarContainer: {
        position: 'absolute', // Use absolute positioning to control the location
      top: '5%', // Start at row 2 (20% of screen height)
      left: '0%', // Start in the 2nd column (10% of screen width)
      width: '100%', // Stay within the 2nd column width (20% of screen width)
      height: '5%', // Span from row 2 to row 5 (40% of screen height)s
      padding: 1, // Optional: Add padding
    },
    content: {
      flex: 1, // Take up remaining space
      padding: 20,
    },
    screenContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
    },
    dropdown: {
      backgroundColor: "#fff", // Optional: Add a background color
      borderColor: "#ccc", // Optional: Add a border for styling
      borderWidth: 1, // Optional: Add a border for styling
      padding: 10, // Optional: Add padding inside the dropdown
    },
  });
  
  export default Layout;
  