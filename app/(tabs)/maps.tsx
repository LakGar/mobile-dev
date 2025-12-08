import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import MapView, { Circle, Marker } from "react-native-maps";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.25; // 25% of screen
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75; // 75% of screen

export default function MapsScreen() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const color1 = useThemeColor({}, "color1");
  const color2 = useThemeColor({}, "color2");
  const color3 = useThemeColor({}, "color3");
  const color4 = useThemeColor({}, "color4");
  const insets = useSafeAreaInsets();

  // Start at minimum height (25% visible, so translate up by the difference)
  const translateY = useSharedValue(
    BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      // Geocode the specific address
      const addressToGeocode = "318 orchard ave sunnyvale 94085 CA";
      console.log("Geocoding address:", addressToGeocode);

      const geocodeResult = await Location.geocodeAsync(addressToGeocode);

      if (geocodeResult && geocodeResult.length > 0) {
        const locationData = geocodeResult[0];
        console.log("Geocoded location:", locationData);

        // Create a location object from geocoded data
        const geocodedLocation: Location.LocationObject = {
          coords: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            altitude: null,
            accuracy: 10, // Geocoded addresses are typically accurate to ~10 meters
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };

        // Set the address
        setAddress(addressToGeocode);
        setLocation(geocodedLocation);
        setLocationError(null);
        setIsLoadingLocation(false);
        return;
      } else {
        throw new Error("Address not found");
      }
    } catch (geocodeError) {
      console.error("Geocoding error:", geocodeError);
      // Fallback to GPS location if geocoding fails
      try {
        // Check if location services are enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setLocationError(
            "Location services are disabled. Please enable them in settings."
          );
          setIsLoadingLocation(false);
          return;
        }

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError(
            "Location permission denied. Please grant location access in settings."
          );
          setIsLoadingLocation(false);
          return;
        }

        // Get current location with highest accuracy
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          mayShowUserSettingsDialog: true,
        });

        console.log("Location fetched successfully:", {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          altitude: currentLocation.coords.altitude,
        });

        // Verify location accuracy - if accuracy is too poor (> 100 meters), try again
        let finalLocation = currentLocation;
        if (
          currentLocation.coords.accuracy &&
          currentLocation.coords.accuracy > 100
        ) {
          console.warn(
            "Location accuracy is poor, trying again...",
            currentLocation.coords.accuracy
          );
          // Try once more with highest accuracy
          const retryLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          console.log("Retry location:", {
            latitude: retryLocation.coords.latitude,
            longitude: retryLocation.coords.longitude,
            accuracy: retryLocation.coords.accuracy,
          });
          finalLocation = retryLocation;
        }

        // Reverse geocode to get address
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: finalLocation.coords.latitude,
            longitude: finalLocation.coords.longitude,
          });

          if (reverseGeocode && reverseGeocode.length > 0) {
            const addr = reverseGeocode[0];
            const fullAddress = [
              addr.street,
              addr.city,
              addr.region,
              addr.postalCode,
            ]
              .filter(Boolean)
              .join(", ");

            console.log("Reverse geocoded address:", fullAddress);
            console.log(
              "City:",
              addr.city,
              "Region:",
              addr.region,
              "Street:",
              addr.street
            );
            setAddress(
              fullAddress || `${addr.city || ""}, ${addr.region || ""}`
            );
          }
        } catch (reverseGeocodeError) {
          console.error("Reverse geocoding error:", reverseGeocodeError);
        }

        setLocation(finalLocation);
        setLocationError(null);
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError(
          `Failed to get location: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const previousLocations = [
    {
      id: 1,
      address: "401 West Springfield Ave",
      location: "Philadelphia, PA 19118",
      color: color1,
      icon: "house.fill",
      image: require("@/assets/images/map.png"),
    },
    {
      id: 2,
      address: "123 Business Street",
      location: "New York, NY 10001",
      color: color2,
      icon: "location.fill",
      image: require("@/assets/images/map2.png"),
    },
    {
      id: 3,
      address: "456 Fitness Avenue",
      location: "Boston, MA 02115",
      color: color3,
      icon: "map.fill",
      image: require("@/assets/images/map.png"),
    },
    {
      id: 4,
      address: "789 Nature Park Road",
      location: "San Francisco, CA 94102",
      color: color4,
      icon: "mappin.circle.fill",
      image: require("@/assets/images/map2.png"),
    },
  ];

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateY = event.translationY;
      const minTranslate = BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT; // Minimized position
      const maxTranslate = 0; // Expanded position

      if (isExpanded) {
        // If expanded, allow dragging down
        if (newTranslateY > 0) {
          translateY.value = maxTranslate + newTranslateY;
        }
      } else {
        // If minimized, allow dragging up
        if (newTranslateY < 0) {
          translateY.value = minTranslate + newTranslateY;
        }
      }
    })
    .onEnd((event) => {
      const threshold = SCREEN_HEIGHT * 0.1; // 10% threshold
      const minTranslate = BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT;
      const maxTranslate = 0;

      if (isExpanded) {
        // If expanded and dragged down enough, minimize
        if (event.translationY > threshold) {
          translateY.value = withSpring(minTranslate);
          runOnJS(setIsExpanded)(false);
        } else {
          // Snap back to expanded
          translateY.value = withSpring(maxTranslate);
        }
      } else {
        // If minimized and dragged up enough, expand
        if (event.translationY < -threshold) {
          translateY.value = withSpring(maxTranslate);
          runOnJS(setIsExpanded)(true);
        } else {
          // Snap back to minimized
          translateY.value = withSpring(minTranslate);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleLocationPress = (locationId: number) => {
    router.push("/zone-detail");
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Main Map View */}
        <View style={styles.mapContainer}>
          {isLoadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={textColor} />
              <Text style={[styles.loadingText, { color: textColor }]}>
                Loading map...
              </Text>
            </View>
          ) : location ? (
            <>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                region={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                mapType="standard"
                followsUserLocation={true}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="I am at my house"
                  description={
                    address ||
                    `Lat: ${location.coords.latitude.toFixed(
                      6
                    )}, Lng: ${location.coords.longitude.toFixed(6)}`
                  }
                />
                {/* 300 meter proximity circle */}
                <Circle
                  center={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  radius={200}
                  strokeWidth={2}
                  strokeColor={textColor + "40"}
                  fillColor={textColor + "15"}
                />
              </MapView>
              {/* Location Label Overlay */}
              <View style={styles.locationLabelContainer}>
                <View
                  style={[
                    styles.locationLabel,
                    { backgroundColor: backgroundColor + "E6", borderColor },
                  ]}
                >
                  <IconSymbol name="house.fill" size={16} color={textColor} />
                  <Text
                    style={[styles.locationLabelText, { color: textColor }]}
                  >
                    {address ? address.split(",")[0] : "I am at my house"}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <IconSymbol
                name="location.fill"
                size={48}
                color={muteTextColor}
              />
              <Text style={[styles.errorText, { color: textColor }]}>
                {locationError || "Unable to load map"}
              </Text>
              {locationError && (
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { borderColor, backgroundColor: backgroundColor },
                  ]}
                  onPress={fetchLocation}
                >
                  <Text style={[styles.retryButtonText, { color: textColor }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Bottom Sheet Modal */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.bottomSheet,
              { backgroundColor, borderColor },
              animatedStyle,
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar}>
              <View
                style={[styles.handle, { backgroundColor: muteTextColor }]}
              />
            </View>

            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <Text style={[styles.bottomSheetTitle, { color: textColor }]}>
                Previous Locations
              </Text>
            </View>

            {/* Locations List */}
            <ScrollView
              style={styles.locationsScroll}
              contentContainerStyle={[
                styles.locationsContent,
                { paddingBottom: insets.bottom + 20 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {previousLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationCard,
                    { backgroundColor: location.color, borderColor },
                  ]}
                  onPress={() => handleLocationPress(location.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.locationMapContainer}>
                    <Image
                      source={location.image}
                      style={styles.locationMapImage}
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
                        color="#000"
                      />
                    </TouchableOpacity>
                    {/* Blur overlay at bottom */}
                    <BlurView intensity={80} style={styles.blurOverlay}>
                      <View style={styles.cardContent}>
                        <Text
                          style={[styles.cardAddress, { color: textColor }]}
                        >
                          {location.address}
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
                            {location.location}
                          </Text>
                        </View>
                      </View>
                    </BlurView>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationLabelContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  locationLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationLabelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_MAX_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  bottomSheetHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  locationsScroll: {
    flex: 1,
  },
  locationsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  locationCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  locationMapContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  locationMapImage: {
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
