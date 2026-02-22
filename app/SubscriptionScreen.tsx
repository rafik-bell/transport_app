import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../constants/config';
import { router } from 'expo-router';

interface ProductItem {
  name: string;
  category: string;
  operators: string[];
  duration_days: number;
  price: number;
  icon: string;
}

const BenefitTag = ({ text }: { text: string }) => (
  <View style={styles.benefitTag}>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

export default function SubscriptionScreen() {
  const route = useRoute();
  const { category, selected } = route.params as any;
  const [products, setProducts] = React.useState<ProductItem[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductItem | null>(null);

  // Fetch Products
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', category, selected],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: category.id,
          operator_ids: selected.filter((op: any) => op.isSelected).map((op: any) => op.id),
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  // Format + Filter Data
  React.useEffect(() => {
    if (data) {
      console.log('DATA:', data);
      setProducts(data);
    }
  }, [data, category, selected]);

  // Card Renderer
  const renderCard = ({ item }: { item: ProductItem }) => (
    <View style={styles.card}>
      {/* Left */}
      <View style={styles.leftSection}>
        <Image source={{ uri: item.icon || '' }} style={styles.iconCircle} />
        <Text style={styles.leftPrice}>{item.price}</Text>
        <Text style={styles.leftCurrency}>DA</Text>
      </View>

      {/* Right */}
      <View style={styles.rightSection}>
        <Text style={styles.rightTitle}>{item.name}</Text>
        <Text style={styles.rightSubtitle}>{item.duration_days} Day Access</Text>

        <View style={styles.benefits}>
          {(item.operators || []).map((op) => (
            <BenefitTag key={op} text={op} />
          ))}
        </View>

        <TouchableOpacity
          style={styles.activateButton}
          onPress={() => {
            setSelectedProduct(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.activateText}>Activate Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2C5FA8" />
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={styles.loader}>
        <Text>Error loading products</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <FlatList
        data={products}
        renderItem={renderCard}
        keyExtractor={(item, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Activate Subscription</Text>
            <Text style={styles.modalText}>
              {selectedProduct?.name} for {selectedProduct?.price} DA?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setModalVisible(false);
                  // Navigate to PaymentScreen and pass product data
                  router.replace('/PaymentScreen');
                }}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    margin: 16,
    flexDirection: 'row',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    backgroundColor: '#fff',
  },

  leftSection: {
    width: '40%',
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },

  leftPrice: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },

  leftCurrency: {
    fontSize: 16,
    color: '#fff',
  },

  rightSection: {
    width: '60%',
    padding: 20,
    justifyContent: 'space-between',
  },

  rightTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  rightSubtitle: {
    fontSize: 13,
    color: '#666',
  },

  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  benefitTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },

  benefitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A90E2',
  },

  activateButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  activateText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
