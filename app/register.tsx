// Register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView ,Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API } from '../constants/config';
import { router } from 'expo-router';

export default function Register() {
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(''); // لتحديد أي عنصر في التركيز

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${API.BASE_URL_AUTH}/web/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          login: email,
          email,
          password,
        }),
      });
  
      
  
      const json = JSON.parse(await response.text());
      console.log('RAW RESPONSE:', json);
      
      if (json?.result?.success === true) {
        Alert.alert('Success', 'User registered successfully', [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]);
      } else {
        Alert.alert(
          'Registration failed',
          json?.result?.error || 'Something went wrong'
        );
      }
  
    } catch (error) {
      console.log('Register error:', error);
      Alert.alert('Error', 'Unable to register');
    } finally {
      setLoading(false);
    }
  };
  

  // دالة لتحديد لون الحدود عند التركيز
  const getInputStyle = (inputName: string) => [
    styles.input,
    focusedInput === inputName && styles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="First Name"
        style={getInputStyle('firstName')}
        value={firstName}
        onChangeText={setFirstName}
        editable={!loading}
        onFocus={() => setFocusedInput('firstName')}
        onBlur={() => setFocusedInput('')}
      />

      <TextInput
        placeholder="Last Name"
        style={getInputStyle('lastName')}
        value={lastName}
        onChangeText={setLastName}
        editable={!loading}
        onFocus={() => setFocusedInput('lastName')}
        onBlur={() => setFocusedInput('')}
      />

      <TextInput
        placeholder="Email"
        style={getInputStyle('email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
        onFocus={() => setFocusedInput('email')}
        onBlur={() => setFocusedInput('')}
      />

      <TextInput
        placeholder="Password"
        style={getInputStyle('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        onFocus={() => setFocusedInput('password')}
        onBlur={() => setFocusedInput('')}
      />

      <TextInput
        placeholder="Confirm Password"
        style={getInputStyle('confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
        onFocus={() => setFocusedInput('confirmPassword')}
        onBlur={() => setFocusedInput('')}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
      },
      scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 100,
      },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputFocused: {
    borderColor: '#6C63FF',
    borderWidth: 2,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a29bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
