// app.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, ScrollView, Text, View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image 
            source={require('./IMG_0361.png')} 
            style={styles.image}
          />
          <Text style={styles.title}>Welcome to Gnomeo!</Text>
          <Text style={styles.subtitle}>
            Connecting our community one plant at a time.
          </Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Continue with Email" 
              onPress={() => router.push('/sign-in')} 
              color="#0782F9"
            />
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor="white" style="dark" />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '85%',
  },
  image: {
    width: 150,          // Adjust width as needed
    height: 150,         // Adjust height as needed
    resizeMode: 'contain',
    marginBottom: 20,    // Spacing between the image and the title text
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});
