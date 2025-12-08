import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
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

  const user = {
    username: "lakshaygarg",
    name: "Lakshay Garg",
    bio: "Zone management enthusiast\n📍 Philadelphia, PA",
    profileImage: require("@/assets/images/icon.png"),
  };

  const stats = {
    zones: 12,
    activity: 48,
    streak: 7,
  };

  const zones = [
    {
      id: 1,
      title: "Home Zone",
      image: require("@/assets/images/map.png"),
      icon: "house.fill",
    },
    {
      id: 2,
      title: "Work Zone",
      image: require("@/assets/images/map2.png"),
      icon: "location.fill",
    },
    {
      id: 3,
      title: "Gym Zone",
      image: require("@/assets/images/map.png"),
      icon: "map.fill",
    },
    {
      id: 4,
      title: "Park Zone",
      image: require("@/assets/images/map2.png"),
      icon: "mappin.circle.fill",
    },
    {
      id: 5,
      title: "Coffee Zone",
      image: require("@/assets/images/map.png"),
      icon: "house.fill",
    },
    {
      id: 6,
      title: "Library Zone",
      image: require("@/assets/images/map2.png"),
      icon: "location.fill",
    },
    {
      id: 7,
      title: "Beach Zone",
      image: require("@/assets/images/map.png"),
      icon: "map.fill",
    },
    {
      id: 8,
      title: "Mall Zone",
      image: require("@/assets/images/map2.png"),
      icon: "mappin.circle.fill",
    },
    {
      id: 9,
      title: "Office Zone",
      image: require("@/assets/images/map.png"),
      icon: "house.fill",
    },
  ];

  const handleZonePress = (zoneId: number) => {
    router.push("/zone-detail");
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
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
          >
            <IconSymbol name="gearshape.fill" size={24} color={textColor} />
          </TouchableOpacity>
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
                  source={zone.image}
                  style={styles.zoneImage}
                  contentFit="cover"
                />
                <View style={styles.zoneOverlay}>
                  <IconSymbol name={zone.icon as any} size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
});
