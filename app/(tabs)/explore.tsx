import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../../constants/config';


interface SubscriptionItem {
  name: string;
  icon: string;
  isSelected?: boolean;
}

export default function TabTwoScreen() {
  const navigation = useNavigation<any>();
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionItem[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/operators`); // use 10.0.2.2 for Android
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json();
    },
  });

  React.useEffect(() => {
    if (data) {
      const formatted = data.map((item: any) => ({ ...item, isSelected: false }));
      setSubscriptions(formatted);
    }
  }, [data]);

  const toggleSelect = (index: number) => {
    setSubscriptions(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const sendSelected = () => {
    const selected = subscriptions.filter(item => item.isSelected);
    if (selected.length === 0) {
      alert('Please select at least one subscription!');
      return;
    }
    navigation.navigate('subscribe', { selected });
  };

  const renderCard = ({ item, index }: any) => (
    <TouchableOpacity
      style={[styles.card, item.isSelected && styles.cardSelected]}
      onPress={() => toggleSelect(index)}
      activeOpacity={0.7}
    >
      <View >
              <Image
                source={{ uri: item.icon }}
                style={[styles.iconContainer]}
                resizeMode="contain"
              />
            </View>
      <Text style={[styles.cardTitle, item.isSelected && styles.cardTitleSelected]}>
        {item.name}
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2C5FA8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading subscriptions</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="card" size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerText}>Abonnements</Text>
            <Text style={styles.headerSubtext}>Algiers Public Transit</Text>
          </View>
        </View>
      </View>

     

      <FlatList
        data={subscriptions}
        renderItem={renderCard}
        keyExtractor={(_, i) => i.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.subscriptionList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.sendButton} onPress={sendSelected}>
        <Text style={styles.sendButtonText}>Send Selected</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Keep your existing styles


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  header: {
    backgroundColor: '#2C5FA8',
    paddingTop: 45,
    paddingBottom: 22,
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
