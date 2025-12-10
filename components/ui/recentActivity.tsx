import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";
import { useActivityStore } from "@/stores/useActivityStore";
import { ActivityType } from "@/types";

const RecentActivity = () => {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "muteText");

  const { getRecentActivities } = useActivityStore();
  const activities = getRecentActivities(4);

  const getActivityIcon = (type: ActivityType) => {
    return type === "enter" ? "arrow.down" : "arrow.up";
  };

  const getActivityColor = (type: ActivityType) => {
    return type === "enter" ? "#4CAF50" : "#FF9800";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Recent Activity</ThemedText>
        <TouchableOpacity onPress={() => router.push("/activity-detail")}>
          <Text style={[styles.seeAllButtonText, { color: muteTextColor }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            name="clock"
            size={48}
            color={muteTextColor}
          />
          <Text style={[styles.emptyText, { color: muteTextColor }]}>
            No recent activity
          </Text>
        </View>
      ) : (
        <View style={styles.activityList}>
          {activities.map((activity, index) => (
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
                      { backgroundColor: getActivityColor(activity.type) + "20" },
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
              {index < activities.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: borderColor }]}
                />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentActivity;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  seeAllButtonText: {
    fontSize: 16,
  },
  activityList: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
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
    marginLeft: 52,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
});
