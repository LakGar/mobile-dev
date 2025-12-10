import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "@/utils/api";

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AUTH_STORAGE_KEY = "@zone_app_auth";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userId: null,
      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.post<{
            user: {
              id: string;
              email: string;
              username: string;
              name: string;
              bio: string | null;
              profileImageUrl: string | null;
              streak: number;
            };
            accessToken: string;
            refreshToken: string;
          }>("/auth/login", { email, password });

          if (response.success && response.data) {
            // Store tokens in API client
            await apiClient.setTokens(
              response.data.accessToken,
              response.data.refreshToken
            );

            // Update store
            set({
              isAuthenticated: true,
              token: response.data.accessToken,
              userId: response.data.user.id,
            });

            return { success: true };
          }

          return {
            success: false,
            error: response.error?.message || "Login failed",
          };
        } catch (error: any) {
          console.error("Login error:", error);
          return {
            success: false,
            error: error.message || "Login failed",
          };
        }
      },
      register: async (email: string, password: string, name: string) => {
        try {
          const response = await apiClient.post<{
            user: {
              id: string;
              email: string;
              username: string;
              name: string;
              bio: string | null;
              profileImageUrl: string | null;
              streak: number;
            };
            accessToken: string;
            refreshToken: string;
          }>("/auth/register", { email, password, name });

          if (response.success && response.data) {
            // Store tokens in API client
            await apiClient.setTokens(
              response.data.accessToken,
              response.data.refreshToken
            );

            // Update store
            set({
              isAuthenticated: true,
              token: response.data.accessToken,
              userId: response.data.user.id,
            });

            return { success: true };
          }

          return {
            success: false,
            error: response.error?.message || "Registration failed",
          };
        } catch (error: any) {
          console.error("Registration error:", error);
          return {
            success: false,
            error: error.message || "Registration failed",
          };
        }
      },
      logout: async () => {
        try {
          // Call logout endpoint
          const refreshToken = await AsyncStorage.getItem("@zone_app_refresh_token");
          if (refreshToken) {
            await apiClient.post("/auth/logout", { refreshToken });
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear tokens
          await apiClient.clearTokens();
          set({
            isAuthenticated: false,
            token: null,
            userId: null,
          });
        }
      },
      initializeAuth: async () => {
        try {
          const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
          if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.state?.isAuthenticated && parsed.state?.token) {
              // Verify token is still valid by making a test request
              const testResponse = await apiClient.get("/users/me");
              if (testResponse.success) {
                set({
                  isAuthenticated: true,
                  token: parsed.state.token,
                  userId: parsed.state.userId,
                });
              } else {
                // Token invalid, clear auth
                await apiClient.clearTokens();
                set({
                  isAuthenticated: false,
                  token: null,
                  userId: null,
                });
              }
            }
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          await apiClient.clearTokens();
          set({
            isAuthenticated: false,
            token: null,
            userId: null,
          });
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userId: state.userId,
      }),
    }
  )
);
