import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";


interface PinData {
  title: string;
  description: string;
  lat: number;
  lng: number;
  createdBy?: string;
}

export default function PinDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pin, setPin] = useState<PinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Listen for authentication state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch pin data.
  useEffect(() => {
    const fetchPin = async () => {
      // Ensure id is a string.
      const pinId = Array.isArray(id) ? id[0] : id;
      if (!pinId) {
        router.push("/map");
        return;
      }
      try {
        const docRef = doc(db, "pins", pinId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPin(docSnap.data() as PinData);
        } else {
          router.push("/map");
        }
      } catch (error) {
        console.error("Error fetching pin:", error);
        router.push("/map");
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, [id]);

  // Handle deletion of the pin.
  const handleDelete = async () => {
    const pinId = Array.isArray(id) ? id[0] : id;
    if (!pinId) return;
    Alert.alert("Delete Pin", "Are you sure you want to delete this pin?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "pins", pinId));
            router.push("/map");
          } catch (error) {
            console.error("Error deleting pin:", error);
            Alert.alert("Error", "There was an error deleting the pin.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no pin data, navigate back.
  if (!pin) {
    router.push("/map");
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pin.title}</Text>
      <Text style={styles.description}>{pin.description}</Text>
      <Text>
        Latitude: {pin.lat}, Longitude: {pin.lng}
      </Text>
      <Button title="Back to Map" onPress={() => router.push("/map")} />
      {/* Only show the Delete button if the current user is the creator */}
      {currentUser && pin.createdBy === currentUser.uid && (
        <Button title="Delete Pin" onPress={handleDelete} color="red" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
});