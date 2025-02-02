import React, { useState, useEffect, useRef, memo } from "react";
import { StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, UrlTile, MapPressEvent, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import * as Location from "expo-location";

// Define your pin type.
interface PinData {
  id?: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  createdBy?: string;
}

// A memoized component that renders markers.
// It re-renders whenever the pins prop changes.
const Markers = memo(function Markers({
  pins,
  onMarkerPress,
  markerPressedRef,
}: {
  pins: PinData[];
  onMarkerPress: (pinId?: string) => void;
  markerPressedRef: React.MutableRefObject<boolean>;
}) {
  return (
    <>
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={{ latitude: pin.lat, longitude: pin.lng }}
          title={pin.title}
          description={pin.description}
          onPress={() => {
            markerPressedRef.current = true;
            onMarkerPress(pin.id);
            // Reset the flag shortly after so that tapping the map works normally.
            setTimeout(() => {
              markerPressedRef.current = false;
            }, 100);
          }}
        />
      ))}
    </>
  );
});

export default function MapScreen() {
  const [pins, setPins] = useState<PinData[]>([]);
  const [user, setUser] = useState<any>(null);
  const markerPressedRef = useRef(false);
  // Use a controlled region so that we can update it when the user pans/zooms.
  const [region, setRegion] = useState<Region | null>(null);
  const [addingPin, setAddingPin] = useState<boolean>(false);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // Listen for auth state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Request user location and set the region.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        setRegion({
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // Fetch existing pins from Firestore.
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pins"));
        const fetchedPins: PinData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PinData[];
        setPins(fetchedPins);
      } catch (error) {
        console.error("Error fetching pins:", error);
      }
    };

    fetchPins();
  }, []);

  // Handle map press.
  const handleMapPress = async (event: MapPressEvent) => {
    // If a marker was pressed, ignore this event.
    if (markerPressedRef.current) return;

    const { coordinate } = event.nativeEvent;

    // If not signed in, do not allow pin creation.
    if (!user) {
      Alert.alert("Not Authorized", "Only authorized users can add pins.", [
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    // Ask for confirmation.
    Alert.alert("Place Pin", "Do you want to place a pin at this location?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setAddingPin(true);
          const newPinData: Omit<PinData, "id"> = {
            lat: coordinate.latitude,
            lng: coordinate.longitude,
            title: "New Pin",
            description: "Tap to see details",
            createdBy: user.uid,
          };

          // Optimistically update: add a temporary pin.
          const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
          setPins((prev) => [...prev, { ...newPinData, id: tempId }]);

          try {
            const docRef = await addDoc(collection(db, "pins"), newPinData);
            // Replace the temporary pin with the real one.
            setPins((prev) =>
              prev.map((pin) =>
                pin.id === tempId ? { ...newPinData, id: docRef.id } : pin
              )
            );
          } catch (error) {
            console.error("Error adding pin:", error);
            Alert.alert("Error", "There was an error adding the pin.");
            // Remove the temporary pin if there was an error.
            setPins((prev) => prev.filter((pin) => pin.id !== tempId));
          } finally {
            setAddingPin(false);
          }
        },
      },
    ]);
  };

  // Navigate to the pin detail screen.
  const onMarkerPress = (pinId?: string) => {
    if (!pinId) return;
    router.push(`/map/${pinId}`);
  };

  if (!region) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addingPin && <ActivityIndicator size="small" style={styles.loadingIndicator} />}
      <MapView
        ref={mapRef}
        style={styles.map}
        // Use a controlled region so that user navigation isn’t lost.
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={handleMapPress}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        <Markers pins={pins} onMarkerPress={onMarkerPress} markerPressedRef={markerPressedRef} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  loadingIndicator: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 100,
  },
});