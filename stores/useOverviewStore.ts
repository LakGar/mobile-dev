import { create } from "zustand";
import { OverviewStats } from "@/types";

interface OverviewStore {
  stats: OverviewStats;
  updateStats: (updates: Partial<OverviewStats>) => void;
  refreshStats: () => void;
}

const initialStats: OverviewStats = {
  completed: 10,
  scheduled: 10,
  pending: 10,
  allTasks: 10,
};

export const useOverviewStore = create<OverviewStore>((set) => ({
  stats: initialStats,
  updateStats: (updates) => {
    set((state) => ({
      stats: { ...state.stats, ...updates },
    }));
  },
  refreshStats: () => {
    // In a real app, this would fetch from an API
    // For now, we'll just update the stats
    set((state) => ({
      stats: {
        ...state.stats,
        // Could add logic here to recalculate based on zones/activities
      },
    }));
  },
}));

