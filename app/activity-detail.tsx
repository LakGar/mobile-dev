import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useActivityStore } from "@/stores/useActivityStore";
import { ActivityType } from "@/types";

type FilterType = "all" | "enter" | "exit";
type SortType = "recent" | "oldest" | "zone";

export default function ActivityDetailScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const { activities } = useActivityStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("recent");

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sort) {
      case "recent":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case "oldest":
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case "zone":
        return a.zoneName.localeCompare(b.zoneName);
      default:
        return 0;
    }
  });

  const stats = {
    total: activities.length,
    enter: activities.filter((a) => a.type === "enter").length,
    exit: activities.filter((a) => a.type === "exit").length,
  };

  const getActivityIcon = (type: ActivityType) => {
    return type === "enter" ? "arrow.down" : "arrow.up";
  };

  const getActivityColor = (type: ActivityType) => {
    return type === "enter" ? "#4CAF50" : "#FF9800";
  };

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
        <ThemedText style={styles.headerTitle}>Activity History</ThemedText>
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Total
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>
              {stats.enter}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Entered
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor, borderColor }]}>
            <Text style={[styles.statNumber, { color: "#FF9800" }]}>
              {stats.exit}
            </Text>
            <Text style={[styles.statLabel, { color: muteTextColor }]}>
              Exited
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: muteTextColor }]}>
              Filter:
            </Text>
            <View style={styles.filterButtons}>
              {(["all", "enter", "exit"] as FilterType[]).map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        filter === filterType ? textColor : backgroundColor,
                      borderColor,
                    },
                  ]}
                  onPress={() => setFilter(filterType)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color: filter === filterType ? backgroundColor : textColor,
                      },
                    ]}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: muteTextColor }]}>
              Sort:
            </Text>
            <View style={styles.filterButtons}>
              {(["recent", "oldest", "zone"] as SortType[]).map((sortType) => (
                <TouchableOpacity
                  key={sortType}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        sort === sortType ? textColor : backgroundColor,
                      borderColor,
                    },
                  ]}
                  onPress={() => setSort(sortType)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color: sort === sortType ? backgroundColor : textColor,
                      },
                    ]}
                  >
                    {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Activities List */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          {sortedActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="clock" size={48} color={muteTextColor} />
              <Text style={[styles.emptyText, { color: muteTextColor }]}>
                No activity found
              </Text>
            </View>
          ) : (
            sortedActivities.map((activity, index) => (
              <View key={activity.id}>
                <TouchableOpacity
                  style={styles.activityItem}
                  onPress={() => router.push(`/zone-detail?id=${activity.zoneId}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: getActivityColor(activity.type) + "20",
                        },
                      ]}
                    >
                      <IconSymbol
                        name={activity.icon as any}
                        size={20}
                        color={getActivityColor(activity.type)}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityZoneName, { color: textColor }]}>
                        {activity.zoneName}
                      </Text>
                      <Text style={[styles.activityTime, { color: muteTextColor }]}>
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.activityTypeBadge,
                      { backgroundColor: getActivityColor(activity.type) + "20" },
                    ]}
                  >
                    <IconSymbol
                      name={getActivityIcon(activity.type) as any}
                      size={14}
                      color={getActivityColor(activity.type)}
                    />
                    <Text
                      style={[
                        styles.activityTypeText,
                        { color: getActivityColor(activity.type) },
                      ]}
                    >
                      {activity.type.charAt(0).toUpperCase() +
                        activity.type.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {index < sortedActivities.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: borderColor }]}
                  />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

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
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityZoneName: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityTime: {
    fontSize: 14,
  },
  activityTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    opacity: 0.2,
    marginLeft: 68,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});

