import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useZoneStore } from "@/stores/useZoneStore";
import { useActivityStore } from "@/stores/useActivityStore";

export default function ZoneStatisticsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { getZoneById } = useZoneStore();
  const { activities } = useActivityStore();
  const zone = id ? getZoneById(parseInt(id)) : null;

  const zoneActivities = useMemo(() => {
    if (!zone) return [];
    return activities.filter((activity) => activity.zoneId === zone.id);
  }, [activities, zone]);

  const stats = useMemo(() => {
    if (!zoneActivities.length) {
      return {
        totalVisits: 0,
        enterCount: 0,
        exitCount: 0,
        avgVisitsPerWeek: 0,
        lastVisit: null as Date | null,
        mostActiveDay: "N/A",
      };
    }

    const enterCount = zoneActivities.filter((a) => a.type === "enter").length;
    const exitCount = zoneActivities.filter((a) => a.type === "exit").length;
    const visits = Math.min(enterCount, exitCount);
    
    const dates = zoneActivities.map((a) => new Date(a.timestamp));
    const lastVisit = dates.sort((a, b) => b.getTime() - a.getTime())[0];
    
    const dayCounts: Record<string, number> = {};
    dates.forEach((date) => {
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const weeksDiff = Math.max(1, (Date.now() - dates[dates.length - 1].getTime()) / (1000 * 60 * 60 * 24 * 7));
    const avgVisitsPerWeek = Math.round((visits / weeksDiff) * 10) / 10;

    return {
      totalVisits: visits,
      enterCount,
      exitCount,
      avgVisitsPerWeek,
      lastVisit,
      mostActiveDay,
    };
  }, [zoneActivities]);

  if (!zone) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={muteTextColor} />
          <Text style={[styles.errorText, { color: textColor }]}>
            Zone not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { borderColor }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: textColor }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, borderBottomColor: borderColor },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Zone Statistics</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone Info */}
        <View style={[styles.zoneInfoCard, { backgroundColor, borderColor }]}>
          <View style={styles.zoneHeader}>
            <View
              style={[
                styles.zoneIconContainer,
                { backgroundColor: zone.color + "20" },
              ]}
            >
              <IconSymbol name={zone.icon as any} size={24} color={zone.color} />
            </View>
            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneTitle, { color: textColor }]}>
                {zone.title}
              </Text>
              <Text style={[styles.zoneAddress, { color: muteTextColor }]}>
                {zone.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <IconSymbol name="arrow.down" size={24} color="#4CAF50" />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.enterCount}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Times Entered
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <IconSymbol name="arrow.up" size={24} color="#FF9800" />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.exitCount}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Times Exited
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <IconSymbol name="mappin.circle.fill" size={24} color={textColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.totalVisits}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Total Visits
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <IconSymbol name="clock" size={24} color={textColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.avgVisitsPerWeek}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Visits/Week
            </Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <StatRow
            icon="clock"
            label="Last Visit"
            value={
              stats.lastVisit
                ? stats.lastVisit.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Never"
            }
            color={textColor}
            muteColor={muteTextColor}
          />
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <StatRow
            icon="calendar"
            label="Most Active Day"
            value={stats.mostActiveDay}
            color={textColor}
            muteColor={muteTextColor}
          />
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <StatRow
            icon="chart.bar.fill"
            label="Activity Count"
            value={`${zoneActivities.length} activities`}
            color={textColor}
            muteColor={muteTextColor}
          />
        </View>

        {/* View Activity Button */}
        <TouchableOpacity
          style={[styles.viewActivityButton, { borderColor }]}
          onPress={() => router.push("/activity-detail")}
        >
          <Text style={[styles.viewActivityButtonText, { color: textColor }]}>
            View All Activity
          </Text>
          <IconSymbol name="chevron.right" size={20} color={textColor} />
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const StatRow = ({
  icon,
  label,
  value,
  color,
  muteColor,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  muteColor: string;
}) => (
  <View style={styles.statRow}>
    <View style={styles.statRowLeft}>
      <View style={[styles.statRowIcon, { backgroundColor: muteColor + "20" }]}>
        <IconSymbol name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statRowLabel, { color: muteColor }]}>{label}</Text>
    </View>
    <Text style={[styles.statRowValue, { color: color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  zoneInfoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  zoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneInfo: {
    flex: 1,
    gap: 4,
  },
  zoneTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  zoneAddress: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  statRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statRowLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  statRowValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    opacity: 0.2,
    marginLeft: 60,
  },
  viewActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewActivityButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

