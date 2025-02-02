// app.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, ScrollView, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Placeholder for logo can be added later if needed */}
          <Text style={styles.title}>Welcome to Garden Gnome!</Text>
          <Text style={styles.subtitle}>
            An All-In-One Place For Every Day Gardening Needs
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
    backgroundColor: 'white'
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