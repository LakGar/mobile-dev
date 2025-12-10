import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Zone } from "@/types";
import { apiClient } from "@/utils/api";

interface ZoneStore {
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  fetchZones: () => Promise<void>;
  addZone: (zone: Omit<Zone, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  updateZone: (id: number | string, updates: Partial<Zone>) => Promise<boolean>;
  deleteZone: (id: number | string) => Promise<boolean>;
  getZoneById: (id: number | string) => Zone | undefined;
  refreshZones: () => Promise<void>;
}

// Convert API zone format to app format
const convertApiZone = (apiZone: any): Zone => {
  return {
    id: typeof apiZone.id === 'string' ? parseInt(apiZone.id.replace(/-/g, '').substring(0, 15), 16) : apiZone.id,
    title: apiZone.title,
    address: apiZone.address,
    location: apiZone.location,
    latitude: apiZone.latitude,
    longitude: apiZone.longitude,
    radius: apiZone.radius,
    icon: apiZone.icon,
    color: apiZone.color,
    description: apiZone.description,
    notificationOption: apiZone.notificationOption,
    notificationText: apiZone.notificationText,
    image: apiZone.image || apiZone.imageUrl,
    createdAt: apiZone.createdAt,
    updatedAt: apiZone.updatedAt,
  };
};

export const useZoneStore = create<ZoneStore>()(
  persist(
    (set, get) => ({
      zones: [],
      isLoading: false,
      error: null,
      
      fetchZones: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get<Zone[]>("/zones");
          if (response.success && response.data) {
            const zones = response.data.map(convertApiZone);
            set({ zones, isLoading: false });
          } else {
            set({ error: response.error?.message || "Failed to fetch zones", isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch zones", isLoading: false });
        }
      },

      addZone: async (zoneData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<Zone>("/zones", {
            ...zoneData,
            imageUrl: zoneData.image,
          });
          
          if (response.success && response.data) {
            const newZone = convertApiZone(response.data);
            set((state) => ({
              zones: [newZone, ...state.zones],
              isLoading: false,
            }));
            return true;
          } else {
            set({ error: response.error?.message || "Failed to create zone", isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to create zone", isLoading: false });
          return false;
        }
      },

      updateZone: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const zoneId = typeof id === 'string' ? id : id.toString();
          const response = await apiClient.put<Zone>(`/zones/${zoneId}`, {
            ...updates,
            imageUrl: updates.image,
          });
          
          if (response.success && response.data) {
            const updatedZone = convertApiZone(response.data);
            set((state) => ({
              zones: state.zones.map((zone) =>
                zone.id === id ? updatedZone : zone
              ),
              isLoading: false,
            }));
            return true;
          } else {
            set({ error: response.error?.message || "Failed to update zone", isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to update zone", isLoading: false });
          return false;
        }
      },

      deleteZone: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const zoneId = typeof id === 'string' ? id : id.toString();
          const response = await apiClient.delete(`/zones/${zoneId}`);
          
          if (response.success) {
            set((state) => ({
              zones: state.zones.filter((zone) => zone.id !== id),
              isLoading: false,
            }));
            return true;
          } else {
            set({ error: response.error?.message || "Failed to delete zone", isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to delete zone", isLoading: false });
          return false;
        }
      },

      getZoneById: (id) => {
        return get().zones.find((zone) => zone.id === id);
      },

      refreshZones: async () => {
        await get().fetchZones();
      },
    }),
    {
      name: "zone-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ zones: state.zones }),
    }
  )
);
