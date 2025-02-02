import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';

export default function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        await updateProfile(user, { displayName: username });
        // On successful sign-up, navigate to the home screen
        router.replace('/square');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput 
        placeholder="Username" 
        placeholderTextColor="#555"
        value={username} 
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput 
        placeholder="Email" 
        placeholderTextColor="#555"
        value={email} 
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Password" 
        placeholderTextColor="#555"
        value={password} 
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => router.push('/sign-in')}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff', // Light mode background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000', // Black text
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#000000', // Input text color
  },
  button: {
    backgroundColor: '#0782F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  link: {
    alignItems: 'center',
  },
  linkText: {
    color: '#0782F9',
    textDecorationLine: 'underline',
  },
});