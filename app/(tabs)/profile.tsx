import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/ui/toast-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useActivityStore } from "@/stores/useActivityStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useZoneStore } from "@/stores/useZoneStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ZONE_ITEM_SIZE = (width - 4) / 3; // 3 columns with 1px gaps

export default function ProfileScreen() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const { user, fetchUser, isLoading: isLoadingUser } = useUserStore();
  const { zones, fetchZones } = useZoneStore();
  const { activities, fetchActivities } = useActivityStore();
  const { logout } = useAuthStore();
  const { showToast } = useToast();

  // Fetch data on mount
  React.useEffect(() => {
    if (!user) {
      fetchUser();
    }
    fetchZones();
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading or empty state if user is not loaded
  if (!user && isLoadingUser) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading...
          </Text>
        </View>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            No user data
          </Text>
        </View>
      </ThemedView>
    );
  }

  const stats = {
    zones: zones.length,
    activity: activities.length,
    streak: user.streak || 0,
  };

  const handleZonePress = (zoneId: number) => {
    router.push(`/zone-detail?id=${zoneId}`);
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully");
    router.replace("/main");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Settings */}
        <View style={styles.header}>
          <ThemedText style={styles.headerUsername}>{user.username}</ThemedText>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push("/settings")}
            >
              <IconSymbol name="gearshape.fill" size={24} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleLogout}
            >
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Picture */}
          <View
            style={[styles.profileImageContainer, { borderColor: textColor }]}
          >
            <Image
              source={user.profileImage}
              style={styles.profileImage}
              contentFit="cover"
            />
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {stats.zones}
              </Text>
              <Text style={[styles.statLabel, { color: muteTextColor }]}>
                Zones
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {stats.activity}
              </Text>
              <Text style={[styles.statLabel, { color: muteTextColor }]}>
                Activity
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {stats.streak}
              </Text>
              <Text style={[styles.statLabel, { color: muteTextColor }]}>
                Streak
              </Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: textColor }]}>
            {user.name}
          </Text>
          <Text style={[styles.userBio, { color: textColor }]}>{user.bio}</Text>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={[styles.editButton, { borderColor }]}
          activeOpacity={0.7}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={[styles.editButtonText, { color: textColor }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        {/* Zones Grid */}
        <View style={styles.zonesSection}>
          {zones.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="mappin.slash" size={64} color={muteTextColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No zones yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: muteTextColor }]}>
                Create your first zone to get started
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: textColor }]}
                onPress={() => router.push("/create-zone")}
              >
                <Text
                  style={[styles.emptyButtonText, { color: backgroundColor }]}
                >
                  Create Zone
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.zonesGrid}>
              {zones.map((zone, index) => (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.zoneItem,
                    {
                      width: ZONE_ITEM_SIZE,
                      height: ZONE_ITEM_SIZE,
                      marginRight: (index + 1) % 3 === 0 ? 0 : 1,
                      marginBottom: index < zones.length - 3 ? 1 : 0,
                    },
                  ]}
                  onPress={() => handleZonePress(zone.id)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={zone.image || require("@/assets/images/map.png")}
                    style={styles.zoneImage}
                    contentFit="cover"
                  />
                  <View style={styles.zoneOverlay}>
                    <IconSymbol
                      name={zone.icon as any}
                      size={24}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerUsername: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  settingsButton: {
    padding: 4,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 20,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
  },
  userBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  zonesSection: {
    paddingTop: 8,
  },
  zonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: width,
  },
  zoneItem: {
    position: "relative",
    backgroundColor: "#000",
  },
  zoneImage: {
    width: "100%",
    height: "100%",
  },
  zoneOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
  },
});
