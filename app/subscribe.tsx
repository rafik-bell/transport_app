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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.68;
const CARD_MARGIN = 10;

interface CategoryItem {
  name: string;
  icon: string;
  description?: string;
}

export default function Subscribe() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { selected } = route.params as any;

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const flatListRef = React.useRef<FlatList>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  React.useEffect(() => {
    if (data) setCategories(data);
  }, [data]);

  const openCategory = () => {
    const item = categories[selectedIndex];
    if (!item) return;
    navigation.navigate('SubscriptionScreen', { category: item, selected });
  };

  const onScrollEnd = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (CARD_WIDTH + CARD_MARGIN * 2));
    setSelectedIndex(Math.max(0, Math.min(index, categories.length - 1)));
  };

  const renderCard = ({ item, index }: { item: CategoryItem; index: number }) => {
    const isSelected = index === selectedIndex;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => {
          setSelectedIndex(index);
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }}
        activeOpacity={0.9}
      >
        {/* Illustration */}
        <Image
          source={{ uri: item.icon }}
          style={styles.cardImage}
          resizeMode="contain"
        />

        {/* Name */}
        <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
          {item.name}
        </Text>

        {/* Short description */}
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description.replace(/<[^>]+>/g, '')}
          </Text>
        )}

        {/* Long description */}
        {item.description && (
          <Text style={styles.cardNote} numberOfLines={4}>
            {item.description.replace(/<[^>]+>/g, '')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2C5FA8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#666' }}>Erreur de chargement</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Veuillez sélectionner la catégorie qui vous{'\n'}correspond.
      </Text>

      {/* Horizontal card carousel */}
      <FlatList
        ref={flatListRef}
        data={categories}
        renderItem={renderCard}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {categories.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === selectedIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Next button */}
      <TouchableOpacity style={styles.nextBtn} onPress={openCategory} activeOpacity={0.85}>
        <Text style={styles.nextBtnText}>Suivant</Text>
      </TouchableOpacity>

     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f8',
  },

  // Header
  backBtn: {
    marginTop: 8,
    marginLeft: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 40,
  },

  // Carousel
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
    paddingVertical: 8,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 340,
  },
  cardSelected: {
    backgroundColor: '#e6f5e9',
    shadowOpacity: 0.18,
    elevation: 8,
    borderWidth: 0,
  },
  cardImage: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C5FA8',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitleSelected: {
    color: '#2C8C4A',
  },
  cardDesc: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 4,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 6,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#c5d0e0',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2C5FA8',
  },

  // Next button
  nextBtn: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#5ecb74',
    paddingVertical: 14,
    paddingHorizontal: 64,
    borderRadius: 30,
    shadowColor: '#5ecb74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
  },
  navLabel: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#2C5FA8',
    fontWeight: '700',
  },
});