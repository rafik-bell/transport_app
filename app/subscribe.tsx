import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
 
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../constants/config';
import { useRoute } from '@react-navigation/native';

interface CategoryItem {
  name: string;
  icon: string;
  description?: string;
}

export default function Subscribe() {
  const navigation = useNavigation<any>();
  const route = useRoute();
    const { selected } = route.params as any;
    

  const [categories, setCategories] = React.useState<CategoryItem[]>([]);

  // ✅ Fetch Categories
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  // ✅ Format Data
  React.useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  // ✅ Navigate to details screen
  const openCategory = (item: CategoryItem) => {
    navigation.navigate('SubscriptionScreen', {
      category: item,
      selected
    });
  };

  // ✅ Card UI
  const renderCard = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openCategory(item)}
      activeOpacity={0.8}
    >
      <View >
              <Image
                source={{ uri: item.icon }}
                style={[styles.iconContainer]}
                resizeMode="contain"
              />
            </View>

      <Text style={styles.cardTitle}>{item.name}</Text>

      {item.description && (
        <Text style={styles.note}>
          {item.description.replace(/<[^>]+>/g, '')}
        </Text>
      )}

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#4A90E2"
      />
    </TouchableOpacity>
  );

  // ✅ Loading
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2C5FA8" />
      </View>
    );
  }

  // ✅ Error
  if (error) {
    return (
      <View style={styles.loader}>
        <Text>Error loading categories</Text>
      </View>
    );
  }

  // ✅ Main UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />

     
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Catégories</Text>
        <Text style={styles.subtitle}>
          Sélectionnez la catégorie qui vous correspond
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={categories}
        renderItem={renderCard}
        keyExtractor={(_, i) => i.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.subscriptionList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  titleContainer: { paddingHorizontal: 20,  paddingBottom: 16 },
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

  sendButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    color: '#8a8a8a',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 6,
  },
  sendButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
