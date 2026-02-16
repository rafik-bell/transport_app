import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../constants/config';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

export default function Profile() {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Fetch Current User Info
  // ===============================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        // Get logged-in UID from AsyncStorage
        const uid = await AsyncStorage.getItem('uid');
        if (!uid) {
          Alert.alert('Error', 'User not found');
          navigation.reset({ index: 0, routes: [{ name: 'login' }] });
          return;
        }

        const response = await fetch(
          `${API.BASE_URL_AUTH}/web/dataset/call_kw/res.users/read`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'call',
              params: {
                model: 'res.users',
                method: 'read',
                args: [[parseInt(uid)]], // fetch current user
                kwargs: {
                  fields: ['id', 'name', 'login', 'email', 'image_1920'],
                },
              },
            }),
          }
        );

        const data = await response.json();

        if (data.result && data.result.length > 0) {
          const u = data.result[0];

          setUser({
            firstName: u.name?.split(' ')[0] || '',
            lastName: u.name?.split(' ').slice(1).join(' ') || '',
            email: u.email,
            image: u.image_1920
              ? `data:image/png;base64,${u.image_1920}`
              : 'https://via.placeholder.com/150',
          });
        } else {
          Alert.alert('Error', 'User not found');
        }
      } catch (error) {
        console.log('Error fetching user:', error);
        Alert.alert('Error', 'Unable to fetch user info');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ===============================
  // Logout Function
  // ===============================
  const handleLogout = async () => {
    try {
      await fetch(`${API.BASE_URL_AUTH}/web/session/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
      });

      // Clear stored UID & session
      await AsyncStorage.removeItem('uid');
      await AsyncStorage.removeItem('session_id');

      // Reset navigation to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Unable to logout');
    }
  };

  // ===============================
  // Loading State
  // ===============================
  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!user) return null;

  // ===============================
  // Profile UI
  // ===============================
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Image source={{ uri: user.image }} style={styles.avatar} />
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===============================
// Styles
// ===============================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 25,
    backgroundColor: '#FF4D4D',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
