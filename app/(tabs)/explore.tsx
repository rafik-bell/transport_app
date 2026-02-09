import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface SubscriptionItem {
  title: string;
  isSelected?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function TabTwoScreen() {
  const navigation = useNavigation<any>();

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    { title: 'Bus', isSelected: false, icon: 'bus-outline' },
    { title: 'Metro', isSelected: false, icon: 'train-outline' },
    { title: 'Tramway', isSelected: false, icon: 'subway-outline' },
    { title: 'Train', isSelected: false, icon: 'train-sharp' },
    { title: 'Telepherique', isSelected: false, icon: 'boat-outline' },
  ]);

  const toggleSelect = (index: number) => {
    setSubscriptions(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  // Function to send selected subscriptions
  const sendSelected = () => {
    const selected = subscriptions.filter(item => item.isSelected);
    if (selected.length === 0) {
      alert('Please select at least one subscription!');
      return;
    }
    navigation.navigate('subscribe', { selected }); // send to new page
  };

  const renderCard = ({ item, index }: any) => (
    <TouchableOpacity
      style={[styles.card, item.isSelected && styles.cardSelected]}
      onPress={() => toggleSelect(index)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, item.isSelected && styles.iconContainerSelected]}>
        <Ionicons
          name={item.icon}
          size={32}
          color={item.isSelected ? '#fff' : '#2C5FA8'}
        />
      </View>
      <Text style={[styles.cardTitle, item.isSelected && styles.cardTitleSelected]}>
        {item.title}
      </Text>
      <View style={styles.checkmarkContainer}>
        <Ionicons
          name={item.isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={22}
          color={item.isSelected ? '#4CAF50' : '#ccc'}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="bus" size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerText}>TRANSPORT</Text>
            <Text style={styles.headerSubtext}>Algiers Public Transit</Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Nos Abonnements</Text>
        <Text style={styles.subtitle}>
          Sélectionnez vos moyens de transport préférés
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={subscriptions}
        renderItem={renderCard}
        keyExtractor={(_, i) => i.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.subscriptionList}
        showsVerticalScrollIndicator={false}
      />

      {/* Send Selected Button */}
      <TouchableOpacity style={styles.sendButton} onPress={sendSelected}>
        <Text style={styles.sendButtonText}>Send Selected</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  header: {
    backgroundColor: '#2C5FA8',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerText: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '500' },

  titleContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', fontWeight: '400' },

  subscriptionList: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8eef5',
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#f0f7ff',
    shadowOpacity: 0.15,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: { backgroundColor: '#4A90E2' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#2C5FA8', textAlign: 'center', marginBottom: 8 },
  cardTitleSelected: { color: '#1a5599' },
  checkmarkContainer: { marginTop: 4 },

  sendButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
