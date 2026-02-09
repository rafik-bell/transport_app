import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BenefitTag = ({ text }: { text: string }) => (
  <View
    style={{
      backgroundColor: '#E3F2FD',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      marginRight: 6,
      marginBottom: 6,
    }}
  >
    <Text style={{ fontSize: 11, fontWeight: '600', color: '#4A90E2' }}>
      {text}
    </Text>
  </View>
);

// App rendering only Design6
export default function SubscriptionScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles6.card}>
      <View style={styles6.leftSection}>
        <View style={styles6.iconCircle}>
          <Ionicons name="bicycle" size={40} color="#fff" />
        </View>
        <Text style={styles6.leftPrice}>300</Text>
        <Text style={styles6.leftCurrency}>DA</Text>
      </View>

      <View style={styles6.rightSection}>
        <Text style={styles6.rightTitle}>ETUDIENT</Text>
        <Text style={styles6.rightSubtitle}>30 Day Access</Text>

        <View style={styles6.benefits}>
          <BenefitTag text="Bus" />
          <BenefitTag text="Metro" />
          <BenefitTag text="Train" />
        </View>

        <TouchableOpacity style={styles6.activateButton}>
          <Text style={styles6.activateText}>Activate Now</Text>
        </TouchableOpacity>
      </View>
    </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles6 = StyleSheet.create({
    card: {
      margin: 16,
      flexDirection: 'row',
      height: 220,
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    leftSection: {
      width: '40%',
      backgroundColor: '#4A90E2',
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    leftPrice: {
      fontSize: 36,
      fontWeight: '800',
      color: '#fff',
    },
    leftCurrency: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    rightSection: {
      width: '60%',
      backgroundColor: '#fff',
      padding: 20,
      justifyContent: 'space-between',
    },
    rightTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#1a1a1a',
    },
    rightSubtitle: {
      fontSize: 13,
      color: '#666',
      marginTop: 4,
    },
    benefits: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    activateButton: {
      backgroundColor: '#4A90E2',
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    activateText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
  });
  
