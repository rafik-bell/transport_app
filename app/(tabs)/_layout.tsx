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
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />

        {/* Abonnements */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Abonnements',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />

        {/* If logged in → show Profile */}
        
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="user-circle" size={24} color={color} />
              ),
              
            }}
          />
          
        
        

        {/* If NOT logged in → show Login */}
        
          
        
        
      </Tabs>
    </QueryClientProvider>
  );
}
