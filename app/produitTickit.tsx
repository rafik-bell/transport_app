import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Product {
  id: number;
  name: string;
  code: string;
  type: string;
  ride_number: string;
  active: boolean;
  price: number;
  icon: string | false;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="ticket-outline" size={48} color="#c5d0e0" />
      </View>
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptySubtitle}>
        Aucun ticket disponible pour les opérateurs sélectionnés.
      </Text>
    </View>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  item,
  onPress,
}: {
  item: Product;
  onPress: (item: Product) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.82}
    >
      {/* Active dot */}
      <View
        style={[
          styles.statusDot,
          { backgroundColor: item.active ? '#5ecb74' : '#d1d5db' },
        ]}
      />

      {/* Icon */}
      <View style={styles.iconWrapper}>
        {item.icon ? (
          <Image
            source={{ uri: item.icon }}
            style={styles.productIcon}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="ticket-outline" size={34} color="#2C5FA8" />
        )}
      </View>

      {/* Name */}
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>

      {/* Code badge */}
      {!!item.code && (
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{item.price} DZD</Text>
        </View>
      )}

      {/* Ride number */}
      {!!item.ride_number && (
        <View style={styles.rideRow}>
          <Ionicons name="swap-horizontal-outline" size={12} color="#5ecb74" />
          <Text style={styles.rideText}>{item.ride_number} trajets</Text>
        </View>
      )}

      {/* Arrow */}
      <View style={styles.arrowBtn}>
        <Ionicons name="chevron-forward" size={14} color="#2C5FA8" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ProductsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { selected } = route.params as { selected: number[] };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  const fetchProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${API.BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_ids: selected[0].id }),
      });

      const text = await response.text();
      if (!response.ok) {
        console.warn(`Server error ${response.status}`);
        setError(true);
        return;
      }

      const data: Product[] = JSON.parse(text);
      setProducts(data);
    } catch (err) {
      console.error('Network or parsing error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selected]);

  const handleSelect = (item: Product) => {
    navigation.navigate('PaymentScreenSingel', { 
        product: JSON.stringify(item),
        selected: JSON.stringify(selected),
    });
  };

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2C5FA8" />
          <Text style={styles.loadingText}>Chargement des produits…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />
        <View style={styles.centered}>
          <View style={styles.errorIconWrapper}>
            <Ionicons name="cloud-offline-outline" size={40} color="#f87171" />
          </View>
          <Text style={styles.errorTitle}>Connexion impossible</Text>
          <Text style={styles.errorSub}>Impossible de charger les produits.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main UI ──
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Nos Produits</Text>
          <Text style={styles.headerSub}>
            {products.length} ticket{products.length !== 1 ? 's' : ''} disponible
            {products.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchProducts}>
          <Ionicons name="refresh-outline" size={18} color="#2C5FA8" />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard item={item} onPress={handleSelect} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          products.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
};

export default ProductsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    color: '#8899bb',
    marginTop: 1,
    fontWeight: '500',
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    minHeight: 180,
    justifyContent: 'center',
    gap: 7,
  },
  statusDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#eef2f8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  productIcon: {
    width: 58,
    height: 58,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    lineHeight: 19,
  },
  codeBadge: {
    backgroundColor: '#eef2f8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C5FA8',
    letterSpacing: 0.5,
  },
  rideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideText: {
    fontSize: 11,
    color: '#5ecb74',
    fontWeight: '600',
  },
  arrowBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#eef2f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingText: {
    fontSize: 14,
    color: '#8899bb',
    fontWeight: '500',
  },

  // Error
  errorIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#fff1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  errorSub: {
    fontSize: 13,
    color: '#8899bb',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C5FA8',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8899bb',
    textAlign: 'center',
    lineHeight: 20,
  },
});