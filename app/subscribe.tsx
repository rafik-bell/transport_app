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
import { useRoute } from '@react-navigation/native';

interface SubscriptionItem {
  title: string;
  isExpanded: boolean;
  items?: {
    label: string;
    price: string;
  }[];
  note?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Subscribe() {
  const route = useRoute<any>();
  const { selected } = route.params;
  const navigation = useNavigation<any>();

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      title: 'SCOLAIRE',
      isExpanded: false,
      icon: 'school',
      note: '*Moins de 25 ans - Carte scolaire obligatoire',
    },
    {
      title: 'ETUDIANT',
      isExpanded: false,
      icon: 'library',
      note: '*Carte étudiant obligatoire',
    },
    {
      title: 'JEUNE',
      isExpanded: false,
      icon: 'person',
      note: '*25 à 60 ans',
    },
    {
      title: 'TOUT PUBLIC',
      isExpanded: false,
      icon: 'people',
      note: '*Disponible pour tous',
    },
    {
      title: 'SENIOR',
      isExpanded: false,
      icon: 'accessibility',
      note: '*Plus de 60 ans - Justificatif requis',
    },
    {
      title: 'ABONNEMENT UNIQUE',
      isExpanded: false,
      icon: 'ticket',
      note: '*Utilisation illimitée pendant la durée',
    },
  ]);

  const toggleSubscription = (index: number) => {
    setSubscriptions(prev =>
      prev.map((item, i) => ({
        ...item,
        isExpanded: i === index ? !item.isExpanded : false,
      }))
    );
  };

  const renderCard = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SubscriptionScreen', {
          subscription: item,
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={item.icon || 'card'} 
          size={32} 
          color="#2C5FA8" 
        />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.note}>{item.note}</Text>
      <View style={styles.arrowContainer}>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#4A90E2" 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />

      {/* Header */}
      

      {/* Title Section */}
      <View style={styles.titleContainer}>
       
        <Text style={styles.subtitle}>
          Sélectionnez la catégorie qui vous correspond
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },

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

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  headerSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '500',
  },

  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },

  subscriptionList: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 20,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

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
    minHeight: 180,
    justifyContent: 'space-between',
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

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C5FA8',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  note: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
    flex: 1,
  },

  arrowContainer: {
    marginTop: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContent: {
    width: '100%',
    marginTop: 15,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  priceLabel: { 
    fontSize: 13, 
    color: '#666' 
  },

  priceValue: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#333' 
  },

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

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },

  navButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  facebookButton: { backgroundColor: '#3b5998' },
  linkedinButton: { backgroundColor: '#0077b5' },
  twitterButton: { backgroundColor: '#1da1f2' },
  instagramButton: { backgroundColor: '#e4405f' },
  notificationButton: { backgroundColor: '#ff9800' },
});