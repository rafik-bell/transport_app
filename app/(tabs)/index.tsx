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
import { LinearGradient } from 'expo-linear-gradient';

interface SubscriptionItem {
  name: string;
  icon: string;
}

export default function Tickets() {
  const navigation = useNavigation<any>();
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionItem[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/operators`);
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json();
    },
  });

  React.useEffect(() => {
    if (data) {
      setSubscriptions(data);
    }
  }, [data]);

  const renderCard = ({ item }: { item: SubscriptionItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ticket', { selected: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardInner}>
        <View style={styles.iconWrapper}>
          <Image
            source={{ uri: item.icon }}
            style={styles.iconContainer}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.cardArrow}>
          <Ionicons name="arrow-forward" size={18} color="#2C5FA8" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2C5FA8" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />
        <View style={styles.loader}>
          <Ionicons name="alert-circle-outline" size={64} color="#E63946" />
          <Text style={styles.errorText}>Erreur de chargement</Text>
          <Text style={styles.errorSubtext}>Veuillez réessayer</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5FA8" />

      {/* Header with Gradient */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={['#2C5FA8', '#3A7BC8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="ticket" size={28} color="#2C5FA8" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Tickets</Text>
              <Text style={styles.headerSubtext}>Algiers Public Transit</Text>
            </View>
          </View>
          
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </LinearGradient>
      </View>

      
      {/* Cards Grid */}
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
    backgroundColor: '#F8FAFC' 
  },
  
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500'
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600'
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B'
  },

  // Header Styles
  headerWrapper: {
    elevation: 12,
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    paddingTop: 45,
    paddingBottom: 22,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    zIndex: 2
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTextContainer: {
    flex: 1
  },
  headerText: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  headerSubtext: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 4,
    fontWeight: '500'
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    right: 60,
  },

  // Title Section
  titleContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 32, 
    paddingBottom: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 12,
    letterSpacing: -0.5
  },
  subtitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  subtitleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2C5FA8',
    marginRight: 10
  },
  subtitle: { 
    fontSize: 15, 
    color: '#64748B',
    fontWeight: '500'
  },

  // Cards List
  subscriptionList: { 
    paddingHorizontal: 18, 
    paddingTop: 8, 
    paddingBottom: 24 
  },
  columnWrapper: { 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },

  // Card Styles
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#2C5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  cardInner: {
    padding: 24,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4
  }
});