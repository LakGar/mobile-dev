import { useThemeColor } from "@/hooks/use-theme-color";
import { useZoneStore } from "@/stores/useZoneStore";
import { shareZone } from "@/utils/share";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";
import { ZoneCardSkeleton } from "./loading-skeleton";

const HomeZoneList = () => {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");

  const { zones } = useZoneStore();
  const [isLoading, setIsLoading] = useState(true);
  const displayedZones = zones.slice(0, 4); // Show first 4 zones

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [zones]);

  const handleCardPress = (zoneId: number) => {
    router.push(`/zone-detail?id=${zoneId}`);
  };

  const handleShare = async (e: any, zoneId: number) => {
    e.stopPropagation();
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) {
      await shareZone(zone);
    }
  };

  const handleSeeAll = () => {
    router.push("/(tabs)/explore");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>My Zones</ThemedText>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={[styles.seeAllButtonText, { color: muteTextColor }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.zoneList}
        >
          {[1, 2, 3].map((i) => (
            <ZoneCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : displayedZones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="mappin.slash" size={48} color={muteTextColor} />
          <Text style={[styles.emptyText, { color: muteTextColor }]}>
            No zones yet. Create your first zone!
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.zoneList}
        >
          {displayedZones.map((zone) => (
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
                  source={zone.image || require("@/assets/images/map.png")}
                  style={styles.mapImage}
                  contentFit="cover"
                />
                {/* Share button */}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={(e) => handleShare(e, zone.id)}
                >
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={16}
                    color={"#000"}
                  />
                </TouchableOpacity>
                {/* Blur overlay at bottom */}
                <BlurView intensity={30} style={styles.blurOverlay}>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardAddress, { color: "grey" }]}>
                      {zone.address}
                    </Text>
                    <View style={styles.cardLocation}>
                      <IconSymbol
                        name="paperplane.fill"
                        size={12}
                        color={"grey"}
                      />
                      <Text
                        style={[styles.cardLocationText, { color: "grey" }]}
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
      )}
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
