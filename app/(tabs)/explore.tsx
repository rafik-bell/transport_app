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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../../constants/config';

type Mode = 'ticket' | 'abonnement';

interface TransportItem {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
}

export default function FormuleScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = React.useState<Mode>('ticket');
  const [transports, setTransports] = React.useState<TransportItem[]>([]);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/operators`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  React.useEffect(() => {
    if (data) {
      setTransports(data.map((item: any) => ({ ...item, isSelected: false })));
    }
  }, [data]);

  const switchMode = () => {
    const newMode = mode === 'ticket' ? 'abonnement' : 'ticket';
    setMode(newMode);
    setTransports(prev => prev.map(item => ({ ...item, isSelected: false })));
    Animated.spring(slideAnim, {
      toValue: newMode === 'abonnement' ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
    }).start();
  };

  const toggleSelect = (index: number) => {
    if (mode === 'ticket') {
      setTransports(prev =>
        prev.map((item, i) => ({
          ...item,
          isSelected: i === index ? !item.isSelected : false,
        }))
      );
    } else {
      setTransports(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, isSelected: !item.isSelected } : item
        )
      );
    }
  };

  const selectedCount = transports.filter(t => t.isSelected).length;

  const handleNext = () => {
    const selected = transports.filter(t => t.isSelected);
    if (selected.length === 0) {
      alert('Veuillez sélectionner au moins un moyen de transport.');
      return;
    }
    if (mode === 'ticket') {
      navigation.navigate('produitTickit' as never, { selected } as never);
    } else {
      navigation.navigate('subscribe' as never, { selected } as never);
    }
  };

  // Interpolated colors for the toggle track
  const trackColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#C8DDF9', '#1A56C4'],
  });

  const thumbPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 30],
  });

  const renderItem = ({ item, index }: { item: TransportItem; index: number }) => (
    <TouchableOpacity
      style={[styles.card, item.isSelected && styles.cardSelected]}
      onPress={() => toggleSelect(index)}
      activeOpacity={0.8}
    >
      <View style={styles.selectorWrapper}>
        {mode === 'ticket' ? (
          <View style={[styles.radio, item.isSelected && styles.radioSelected]}>
            {item.isSelected && <View style={styles.radioDot} />}
          </View>
        ) : (
          <View style={[styles.checkbox, item.isSelected && styles.checkboxSelected]}>
            {item.isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </View>

      <Text style={styles.cardName}>{item.name}</Text>

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
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
          <Text style={styles.refreshText}>Réessayer</Text>
        </TouchableOpacity>
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

      {/* Toggle Switch Row */}
      <View style={styles.switchRow}>
        <Text style={[styles.modeLabel, mode === 'ticket' && styles.modeLabelActive]}>🎫 Ticket</Text>

        <TouchableOpacity onPress={switchMode} activeOpacity={0.9}>
          <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
            <Animated.View style={[styles.thumb, { left: thumbPosition }]} />
          </Animated.View>
        </TouchableOpacity>

        <Text style={[styles.modeLabel, mode === 'abonnement' && styles.modeLabelActive]}>📋 Abonnement</Text>
      </View>

      <Text style={styles.modeHint}>
        {mode === 'ticket'
          ? 'Un seul transport sélectionnable'
          : 'Plusieurs transports sélectionnables'}
      </Text>

      <FlatList
        data={transports}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedCount === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
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

const BLUE = '#1A56C4';
const GREEN_CARD = '#A8E6A3';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF1FB', paddingTop: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EAF1FB' },
  errorText: { fontSize: 18, color: '#FF4D4D', fontWeight: 'bold' },
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  refreshText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: BLUE, marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#555', lineHeight: 20 },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  modeLabel: { fontSize: 14, fontWeight: '600', color: '#aaa' },
  modeLabelActive: { color: BLUE, fontWeight: '700' },

  track: { width: 56, height: 28, borderRadius: 14, justifyContent: 'center', position: 'relative' },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    top: 3,
  },

  modeHint: { fontSize: 12, color: '#888', textAlign: 'center', fontStyle: 'italic', marginTop: 6, marginBottom: 10 },
  listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    height: 72,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardSelected: { backgroundColor: GREEN_CARD },
  selectorWrapper: { marginRight: 12 },

  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: BLUE, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  radioSelected: { borderColor: BLUE },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: BLUE },

  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: BLUE, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxSelected: { backgroundColor: BLUE, borderColor: BLUE },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800', lineHeight: 16 },

  cardName: { flex: 1, fontSize: 20, fontWeight: '700', color: BLUE },
  cardIcon: { width: 70, height: 50 },
  iconPlaceholder: { width: 70, height: 50 },

  footer: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 8, alignItems: 'flex-end' },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#A5D6A7' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#388E3C',
    borderWidth: 2,
    borderColor: '#fff',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});