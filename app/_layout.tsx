import { Stack, Redirect } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const queryClient = new QueryClient();

type StartRoute = "/onboarding" | "/login" | "/(tabs)" | null;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [startRoute, setStartRoute] = useState<StartRoute>(null);

  useEffect(() => {
    const init = async () => {
      const launched = await AsyncStorage.getItem("alreadyLaunched");
      const sessionId = await AsyncStorage.getItem("sessionId");

      if (!launched) {
        setStartRoute("/onboarding");
      } else if (!sessionId) {
        setStartRoute("/login");
      } else {
        setStartRoute("/(tabs)");
      }
    };

    init();
  }, []);

  // wait until storage checked
  if (!startRoute) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>

        {/* initial redirect */}
        <Redirect href={startRoute} />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>

      </ThemeProvider>
    </QueryClientProvider>
  );
}
