import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Activity } from "@/types";
import { apiClient } from "@/utils/api";

interface ActivityStore {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: (zoneId?: number | string) => Promise<void>;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<boolean>;
  getRecentActivities: (limit?: number) => Activity[];
  getActivitiesByZoneId: (zoneId: number | string) => Activity[];
}

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

// Convert API activity format to app format
const convertApiActivity = (apiActivity: any): Activity => {
  const timestamp = typeof apiActivity.timestamp === 'number' 
    ? apiActivity.timestamp 
    : parseInt(apiActivity.timestamp.toString());
  
  return {
    id: typeof apiActivity.id === 'string' 
      ? parseInt(apiActivity.id.replace(/-/g, '').substring(0, 15), 16) 
      : apiActivity.id,
    zoneId: typeof apiActivity.zoneId === 'string'
      ? parseInt(apiActivity.zoneId.replace(/-/g, '').substring(0, 15), 16)
      : apiActivity.zoneId,
    zoneName: apiActivity.zoneName,
    type: apiActivity.type,
    time: apiActivity.time || formatTimeAgo(timestamp),
    timestamp,
    icon: apiActivity.icon,
  };
};

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],
      isLoading: false,
      error: null,

      fetchActivities: async (zoneId?: number | string) => {
        set({ isLoading: true, error: null });
        try {
          const params = zoneId ? `?zoneId=${zoneId}` : '';
          const response = await apiClient.get<Activity[]>(`/activities${params}`);
          
          if (response.success && response.data) {
            const activities = response.data.map(convertApiActivity);
            set({ activities, isLoading: false });
          } else {
            set({ error: response.error?.message || "Failed to fetch activities", isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch activities", isLoading: false });
        }
      },

      addActivity: async (activityData) => {
        set({ isLoading: true, error: null });
        try {
          const zoneId = typeof activityData.zoneId === 'number' 
            ? activityData.zoneId.toString() 
            : activityData.zoneId;
          
          const response = await apiClient.post<Activity>("/activities", {
            zoneId,
            type: activityData.type,
          });
          
          if (response.success && response.data) {
            const newActivity = convertApiActivity(response.data);
            set((state) => ({
              activities: [newActivity, ...state.activities],
              isLoading: false,
            }));
            return true;
          } else {
            set({ error: response.error?.message || "Failed to create activity", isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to create activity", isLoading: false });
          return false;
        }
      },

      getRecentActivities: (limit = 10) => {
        return get()
          .activities.slice(0, limit)
          .map((activity) => ({
            ...activity,
            time: formatTimeAgo(activity.timestamp),
          }));
      },

      getActivitiesByZoneId: (zoneId) => {
        return get()
          .activities.filter((activity) => {
            const activityZoneId = typeof activity.zoneId === 'string' 
              ? parseInt(activity.zoneId.replace(/-/g, '').substring(0, 15), 16)
              : activity.zoneId;
            const filterZoneId = typeof zoneId === 'string'
              ? parseInt(zoneId.replace(/-/g, '').substring(0, 15), 16)
              : zoneId;
            return activityZoneId === filterZoneId;
          })
          .map((activity) => ({
            ...activity,
            time: formatTimeAgo(activity.timestamp),
          }));
      },
    }),
    {
      name: "activity-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activities: state.activities }),
    }
  )
);
