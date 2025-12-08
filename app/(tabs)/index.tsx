import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import Header from "@/components/ui/header";
import HomeZoneList from "@/components/ui/homeZoneList";
import Overview from "@/components/ui/overview";
import RecentActivity from "@/components/ui/recentActivity";
import Welcome from "@/components/ui/welcome";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView>
      <Header />
        <Welcome />
        <Overview />
        <HomeZoneList />
        <RecentActivity />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
});
