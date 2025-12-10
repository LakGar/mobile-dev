import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingStore {
  hasCompletedOnboarding: boolean | null;
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  initializeOnboarding: () => Promise<void>;
}

const ONBOARDING_STORAGE_KEY = "@zone_app_onboarding_complete";

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hasCompletedOnboarding: null,
  setOnboardingComplete: async (complete: boolean) => {
    set({ hasCompletedOnboarding: complete });
    try {
      await AsyncStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        complete.toString()
      );
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  },
  initializeOnboarding: async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      set({
        hasCompletedOnboarding: completed === "true",
      });
    } catch (error) {
      console.error("Error loading onboarding status:", error);
      set({ hasCompletedOnboarding: false });
    }
  },
}));

