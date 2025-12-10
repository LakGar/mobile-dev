import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSegments, useRouter } from "expo-router";
import { ToastProvider } from "@/components/ui/toast-provider";
import * as SplashScreen from "expo-splash-screen";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding, initializeOnboarding } = useOnboardingStore();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Hide native splash screen
    SplashScreen.hideAsync();
    
    // Initialize both auth and onboarding
    Promise.all([initializeAuth(), initializeOnboarding()]).then(() => {
      setIsInitialized(true);
    });
  }, [initializeAuth, initializeOnboarding]);

  useEffect(() => {
    if (!isInitialized) return;

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === "login" || currentSegment === "register";
    const inMainGroup = currentSegment === "main";
    const inOnboardingGroup = currentSegment === "onboarding";
    const inTabsGroup = currentSegment === "(tabs)";

    // If not authenticated, show main screen (unless already on auth/main screens)
    if (!isAuthenticated) {
      if (!inAuthGroup && !inMainGroup) {
        router.replace("/main");
      }
      return;
    }

    // If authenticated but hasn't completed onboarding
    if (isAuthenticated && hasCompletedOnboarding === false) {
      if (!inOnboardingGroup) {
        router.replace("/onboarding");
      }
      return;
    }

    // If authenticated and completed onboarding, go to tabs
    if (isAuthenticated && hasCompletedOnboarding === true) {
      if (inOnboardingGroup || inMainGroup || inAuthGroup) {
        router.replace("/(tabs)");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasCompletedOnboarding, isInitialized, segments]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <Stack>
        <Stack.Screen name="main" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="zone-detail"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="appearance" options={{ headerShown: false }} />
        <Stack.Screen name="create-zone" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-settings" options={{ headerShown: false }} />
        <Stack.Screen name="language" options={{ headerShown: false }} />
        <Stack.Screen name="data-storage" options={{ headerShown: false }} />
        <Stack.Screen name="help-center" options={{ headerShown: false }} />
        <Stack.Screen name="contact-us" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
        <Stack.Screen name="email-phone" options={{ headerShown: false }} />
        <Stack.Screen name="two-factor" options={{ headerShown: false }} />
        <Stack.Screen name="location-sharing" options={{ headerShown: false }} />
        <Stack.Screen name="delete-account" options={{ headerShown: false }} />
        <Stack.Screen name="activity-detail" options={{ headerShown: false }} />
        <Stack.Screen name="zone-statistics" options={{ headerShown: false }} />
        <Stack.Screen name="zone-quick-edit" options={{ headerShown: false }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ToastProvider>
    </ThemeProvider>
  );
}
