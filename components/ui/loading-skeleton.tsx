import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const backgroundColor = useThemeColor({}, "muteText");
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: backgroundColor + "40",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ZoneCardSkeleton() {
  const borderColor = useThemeColor({}, "muteText");

  return (
    <View style={[styles.zoneCard, { borderColor }]}>
      <Skeleton width="100%" height={200} borderRadius={16} />
      <View style={styles.zoneCardContent}>
        <Skeleton width="70%" height={16} borderRadius={8} />
        <Skeleton width="50%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function ActivityItemSkeleton() {
  const borderColor = useThemeColor({}, "muteText");

  return (
    <View style={[styles.activityItem, { borderBottomColor: borderColor }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.activityContent}>
        <Skeleton width="60%" height={16} borderRadius={8} />
        <Skeleton width="40%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.profileContainer}>
      <Skeleton width={90} height={90} borderRadius={45} />
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Skeleton width={40} height={18} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={40} height={18} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={40} height={18} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zoneCard: {
    width: 280,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginRight: 16,
  },
  zoneCardContent: {
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  activityContent: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 20,
  },
  profileStats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
});

