import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Profile() {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    image: 'https://example.com/profile.jpg', // Replace with your image URL
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Image source={{ uri: user.image }} style={styles.avatar} />
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
    </View>
  );
}

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
    elevation: 10, // For Android shadow
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
});
