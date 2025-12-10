import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import Header from "@/components/ui/header";
import HomeZoneList from "@/components/ui/homeZoneList";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Overview from "@/components/ui/overview";
import RecentActivity from "@/components/ui/recentActivity";
import Welcome from "@/components/ui/welcome";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useActivityStore } from "@/stores/useActivityStore";
import { useOverviewStore } from "@/stores/useOverviewStore";
import { useUserStore } from "@/stores/useUserStore";
import { useZoneStore } from "@/stores/useZoneStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshStats } = useOverviewStore();
  const { fetchZones, refreshZones } = useZoneStore();
  const { fetchUser, user } = useUserStore();
  const { fetchActivities } = useActivityStore();
  const [refreshing, setRefreshing] = useState(false);
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  // Fetch data on mount
  useEffect(() => {
    fetchZones();
    if (!user) {
      fetchUser();
    }
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshZones(),
      fetchUser(),
      fetchActivities(),
      refreshStats(),
    ]);
    setRefreshing(false);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header />
        <Welcome />
        <Overview />
        <HomeZoneList />
        <RecentActivity />
      </ScrollView>
      {/* Create Zone FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: textColor,
            bottom: insets.bottom + 20,
          },
        ]}
        onPress={() => router.push("/create-zone")}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={24} color={backgroundColor} />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  fab: {
    position: "absolute",
    top: 750,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
