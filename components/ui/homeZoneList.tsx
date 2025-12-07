import { useThemeColor } from "@/hooks/use-theme-color";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";

const HomeZoneList = () => {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const color1 = useThemeColor({}, "color1");
  const color2 = useThemeColor({}, "color2");
  const color3 = useThemeColor({}, "color3");
  const color4 = useThemeColor({}, "color4");
  const borderColor = useThemeColor({}, "muteText");

  const zones = [
    {
      id: 1,
      title: "Home Zone",
      address: "401 West Springfield Ave",
      location: "Philadelphia, PA 19118",
      color: color1,
      icon: "house.fill",
    },
    {
      id: 2,
      title: "Work Zone",
      address: "123 Business Street",
      location: "New York, NY 10001",
      color: color2,
      icon: "location.fill",
    },
    {
      id: 3,
      title: "Gym Zone",
      address: "456 Fitness Avenue",
      location: "Boston, MA 02115",
      color: color3,
      icon: "map.fill",
    },
    {
      id: 4,
      title: "Park Zone",
      address: "789 Nature Park Road",
      location: "San Francisco, CA 94102",
      color: color4,
      icon: "mappin.circle.fill",
    },
  ];

  const handleCardPress = (zoneId: number) => {
    router.push("/zone-detail");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>My Zones</ThemedText>
        <TouchableOpacity>
          <Text style={[styles.seeAllButtonText, { color: muteTextColor }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.zoneList}
      >
        {zones.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={[
              styles.card,
              { backgroundColor: zone.color, borderColor: zone.color },
            ]}
            onPress={() => handleCardPress(zone.id)}
            activeOpacity={0.8}
          >
            <View style={styles.mapContainer}>
              <Image
                source={require("@/assets/images/map.png")}
                style={styles.mapImage}
                contentFit="cover"
              />
              {/* Share button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // Handle share action
                }}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={16}
                  color={"#000"}
                />
              </TouchableOpacity>
              {/* Blur overlay at bottom */}
              <BlurView intensity={80} style={styles.blurOverlay}>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardAddress, { color: textColor }]}>
                    {zone.address}
                  </Text>
                  <View style={styles.cardLocation}>
                    <IconSymbol
                      name="paperplane.fill"
                      size={12}
                      color={muteTextColor}
                    />
                    <Text
                      style={[
                        styles.cardLocationText,
                        { color: muteTextColor },
                      ]}
                    >
                      {zone.location}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeZoneList;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  seeAllButtonText: {
    fontSize: 16,
  },
  zoneList: {},
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    width: 280,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginLeft: 20,
  },
  mapContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  shareButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blurOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  cardAddress: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardLocationText: {
    fontSize: 12,
  },
});
