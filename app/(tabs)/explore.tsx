import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../../constants/config';

interface TransportItem {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
}

export default function FormuleScreen() {
  const navigation = useNavigation();
  const [transports, setTransports] = React.useState<TransportItem[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/operators`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  React.useEffect(() => {
    if (data) {
      setTransports(
        data.map((item: any) => ({ ...item, isSelected: false }))
      );
    }
  }, [data]);

  const toggleSelect = (index: number) => {
    setTransports(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const selectedCount = transports.filter(t => t.isSelected).length;

  const handleNext = () => {
    const selected = transports.filter(t => t.isSelected);
    if (selected.length === 0) {
      alert('Veuillez sélectionner au moins un moyen de transport.');
      return;
    }
    navigation.navigate('subscribe' as never, { selected } as never);
  };

  const renderItem = ({ item, index }: { item: TransportItem; index: number }) => (
    <TouchableOpacity
      style={[styles.card, item.isSelected && styles.cardSelected]}
      onPress={() => toggleSelect(index)}
      activeOpacity={0.8}
    >
      <Text style={[styles.cardName, item.isSelected && styles.cardNameSelected]}>
        {item.name}
      </Text>
      {item.icon ? (
        <Image source={{ uri: item.icon }} style={styles.cardIcon} resizeMode="contain" />
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur lors du chargement</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Formules :</Text>
        <Text style={styles.headerSubtitle}>
          Veuillez sélectionner les moyens de transport{'\n'}
          pour l'acquisition de votre titre de transport.
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={transports}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>Suivant</Text>
          {selectedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CARD_HEIGHT = 72;
const GREEN_SELECTED = '#A8E6A3';
const BLUE_TEXT = '#1A56C4';

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF1FB',
  },
  errorText: {
    color: '#e53935',
    fontSize: 16,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BLUE_TEXT,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    height: CARD_HEIGHT,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: GREEN_SELECTED,
    borderColor: 'transparent',
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
    color: BLUE_TEXT,
  },
  cardNameSelected: {
    color: BLUE_TEXT,
  },
  cardIcon: {
    width: 70,
    height: 50,
  },
  iconPlaceholder: {
    width: 70,
    height: 50,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});