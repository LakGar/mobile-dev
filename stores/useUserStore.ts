import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";
import { apiClient } from "@/utils/api";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  incrementStreak: () => void;
  resetStreak: () => void;
}

// Convert API user format to app format
const convertApiUser = (apiUser: any): User => {
  return {
    username: apiUser.username,
    name: apiUser.name,
    bio: apiUser.bio || "",
    profileImage: apiUser.profileImageUrl || require("@/assets/images/icon.png"),
    email: apiUser.email,
    phone: apiUser.phone || "",
    gender: apiUser.gender || "",
    streak: apiUser.streak || 0,
  };
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get<User>("/users/me");
          if (response.success && response.data) {
            const user = convertApiUser(response.data);
            set({ user, isLoading: false });
          } else {
            set({ error: response.error?.message || "Failed to fetch user", isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch user", isLoading: false });
        }
      },

      updateUser: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const updateData: any = { ...updates };
          if (updateData.profileImage) {
            updateData.profileImageUrl = updateData.profileImage;
            delete updateData.profileImage;
          }

          const response = await apiClient.put<User>("/users/me", updateData);
          
          if (response.success && response.data) {
            const updatedUser = convertApiUser(response.data);
            set({ user: updatedUser, isLoading: false });
            return true;
          } else {
            set({ error: response.error?.message || "Failed to update user", isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to update user", isLoading: false });
          return false;
        }
      },

      incrementStreak: () => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, streak: currentUser.streak + 1 },
          });
        }
      },

      resetStreak: () => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, streak: 0 },
          });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
