import { Tabs } from 'expo-router';
import React, { useEffect, useState,useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem('session_id');
      setLoggedIn(!!session);
    };
  
    // Initial check
    checkSession();
  
    // Poll every 1 second (or whatever interval you prefer)
    const interval = setInterval(checkSession, 100);
  
    return () => clearInterval(interval);
  }, []);
  
  // Wait until login state loads
  if (loggedIn === null) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        {/* Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="home" size={24} color={color} />
            ),
          }}
        />

        {/* Abonnements */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Formules',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="clipboard-list" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
            name="tickets"
            options={{
              title: 'Tickets',
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="ticket-alt" size={24} color={color} />
              ),
              
            }}
          />

        {/* If logged in → show Profile */}
        
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Paramètres',
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="cog" size={24} color={color} />
              ),
              
            }}
          />
          
        
        

        {/* If NOT logged in → show Login */}
        
          
        
        
      </Tabs>
    </QueryClientProvider>
  );
}
