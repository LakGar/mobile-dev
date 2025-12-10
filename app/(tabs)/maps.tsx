import { ThemedView } from "@/components/themed-view";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useZoneStore } from "@/stores/useZoneStore";
import { Place, searchPlacesEnhanced } from "@/utils/places";
import { shareZone } from "@/utils/share";
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
  TextInput,
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
  const [mainLocationCoords, setMainLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string | null>(
    null
  );
  const mapRef = React.useRef<MapView>(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { zones } = useZoneStore();

  // Filter zones by icon type
  const filteredZones = selectedZoneFilter
    ? zones.filter((zone) => zone.icon === selectedZoneFilter)
    : zones;

  // Display actual zones on the map
  const displayZones = filteredZones;

  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(
          "Location permission denied. Please grant location access in settings."
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      // Reverse geocode to get address
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync(coords);
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
          setAddress(fullAddress || `${addr.city || ""}, ${addr.region || ""}`);
        }
      } catch (reverseGeocodeError) {
        console.error("Reverse geocoding error:", reverseGeocodeError);
        setAddress(
          `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        );
      }

      setLocation(currentLocation);
      setMainLocationCoords(coords);
      setLocationError(null);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError(
        `Failed to get location: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const previousLocations = filteredZones.slice(0, 4).map((zone) => ({
    id: zone.id,
    address: zone.address,
    location: zone.location,
    color: zone.color,
    icon: zone.icon,
    image: zone.image || require("@/assets/images/map.png"),
  }));

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

  const handleZonePress = (zoneId: number) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (zone && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: zone.latitude,
          longitude: zone.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSelectedPlaces([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Use enhanced places search
      const centerLat = mainLocationCoords?.latitude;
      const centerLon = mainLocationCoords?.longitude;

      const results = await searchPlacesEnhanced(query, centerLat, centerLon);

      // If we have user location, find the closest result
      if (results.length > 0 && centerLat && centerLon) {
        // Calculate distances and sort by closest
        const resultsWithDistance = results.map((result) => ({
          ...result,
          distance: calculateDistance(
            centerLat,
            centerLon,
            result.latitude,
            result.longitude
          ),
        }));

        // Sort by distance (closest first)
        resultsWithDistance.sort((a, b) => a.distance - b.distance);

        // Keep only the closest result
        const closestResult = resultsWithDistance[0];

        // Show all results in dropdown but only closest on map
        setSearchResults(resultsWithDistance);
        setSelectedPlaces([closestResult]);

        // Navigate to closest result
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: closestResult.latitude,
              longitude: closestResult.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            500
          );
        }
      } else if (results.length > 0) {
        // No user location, show all results
        setSearchResults(results);
        setSelectedPlaces(results);

        // Fit map to show all results
        if (mapRef.current && results.length > 0) {
          const coordinates = results.map((r) => ({
            latitude: r.latitude,
            longitude: r.longitude,
          }));

          // Calculate bounds
          const lats = coordinates.map((c) => c.latitude);
          const lons = coordinates.map((c) => c.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);

          const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
          const lonDelta = Math.max(maxLon - minLon, 0.01) * 1.5;

          // Use animateToRegion with calculated bounds
          const centerLat = (minLat + maxLat) / 2;
          const centerLon = (minLon + maxLon) / 2;

          mapRef.current.animateToRegion(
            {
              latitude: centerLat,
              longitude: centerLon,
              latitudeDelta: latDelta,
              longitudeDelta: lonDelta,
            },
            500
          );
        }
      } else {
        setSearchResults([]);
        setSelectedPlaces([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSelectedPlaces([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setSelectedPlaces([]);
      setIsSearching(false);
      return;
    }

    // Debounce search by 500ms
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectSearchResult = (result: Place) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
      // Keep results visible but highlight selected
      setSearchQuery(result.name);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPlaces([]);
  };

  const getPlaceIcon = (place: Place): string => {
    const type = place.type?.toLowerCase() || "";
    if (
      type.includes("restaurant") ||
      type.includes("food") ||
      type.includes("cafe")
    ) {
      return "fork.knife";
    }
    if (
      type.includes("shop") ||
      type.includes("store") ||
      type.includes("mall")
    ) {
      return "bag.fill";
    }
    if (type.includes("gas") || type.includes("fuel")) {
      return "fuelpump.fill";
    }
    if (type.includes("hotel") || type.includes("lodging")) {
      return "bed.double.fill";
    }
    if (type.includes("hospital") || type.includes("pharmacy")) {
      return "cross.case.fill";
    }
    if (type.includes("school") || type.includes("university")) {
      return "book.fill";
    }
    if (type.includes("park") || type.includes("garden")) {
      return "tree.fill";
    }
    return "mappin.circle.fill";
  };

  const getPlaceColor = (place: Place): string => {
    const type = place.type?.toLowerCase() || "";
    if (
      type.includes("restaurant") ||
      type.includes("food") ||
      type.includes("cafe")
    ) {
      return "#FF6B6B";
    }
    if (type.includes("shop") || type.includes("store")) {
      return "#4ECDC4";
    }
    if (type.includes("business")) {
      return "#95E1D3";
    }
    return "#95A5A6";
  };

  const handlePreviousLocationPress = (locationId: number) => {
    router.push(`/zone-detail?id=${locationId}`);
  };

  const handleShareLocation = async (e: any, locationId: number) => {
    e.stopPropagation();
    const zone = zones.find((z) => z.id === locationId);
    if (zone) {
      await shareZone(zone);
    }
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
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                mapType="standard"
                followsUserLocation={false}
              >
                {/* Main location marker - Apple Maps style (blue dot with grey circle) */}
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
                >
                  <View style={styles.appleMarkerContainer}>
                    {/* Grey outer circle */}
                    <View style={styles.appleMarkerOuterCircle} />
                    {/* Blue inner dot */}
                    <View style={styles.appleMarkerInnerDot} />
                  </View>
                </Marker>
                {/* 200 meter proximity circle for main location - grey like Apple Maps */}
                <Circle
                  center={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  radius={200}
                  strokeWidth={1}
                  strokeColor="rgba(150, 150, 150, 0.5)"
                  fillColor="rgba(200, 200, 200, 0.1)"
                />
                {/* Search result markers */}
                {selectedPlaces.map((place, index) => (
                  <Marker
                    key={place.id || `place_${index}`}
                    coordinate={{
                      latitude: place.latitude,
                      longitude: place.longitude,
                    }}
                    title={place.name}
                    description={place.address}
                    onPress={() => handleSelectSearchResult(place)}
                  >
                    <View
                      style={[
                        styles.customMarker,
                        { backgroundColor: getPlaceColor(place) },
                      ]}
                    >
                      <IconSymbol
                        name={getPlaceIcon(place) as any}
                        size={20}
                        color="#fff"
                      />
                    </View>
                  </Marker>
                ))}
                {/* Display actual zones */}
                {displayZones.map((zone) => (
                  <React.Fragment key={zone.id}>
                    <Marker
                      coordinate={{
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                      }}
                      title={zone.title}
                      description={zone.address}
                      onPress={() => handleZonePress(zone.id)}
                    >
                      <View
                        style={[
                          styles.customMarker,
                          { backgroundColor: zone.color },
                        ]}
                      >
                        <IconSymbol
                          name={zone.icon as any}
                          size={24}
                          color="#fff"
                        />
                      </View>
                    </Marker>
                    <Circle
                      center={{
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                      }}
                      radius={zone.radius}
                      strokeWidth={2}
                      strokeColor={zone.color + "80"}
                      fillColor={zone.color + "20"}
                    />
                  </React.Fragment>
                ))}
              </MapView>
              {/* Create Zone FAB */}
              <TouchableOpacity
                style={[
                  styles.fab,
                  {
                    backgroundColor: textColor,
                    bottom: insets.bottom + 100,
                  },
                ]}
                onPress={() => router.push("/create-zone")}
                activeOpacity={0.8}
              >
                <IconSymbol name="plus" size={24} color={backgroundColor} />
              </TouchableOpacity>

              {/* Search Input Overlay */}
              <View style={[styles.searchContainer, { top: insets.top + 20 }]}>
                {/* Zone Filters */}
                <View style={styles.filtersContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScrollContent}
                  >
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor:
                            selectedZoneFilter === null
                              ? textColor
                              : backgroundColor,
                          borderColor,
                        },
                      ]}
                      onPress={() => setSelectedZoneFilter(null)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color:
                              selectedZoneFilter === null
                                ? backgroundColor
                                : textColor,
                          },
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {Array.from(new Set(zones.map((z) => z.icon))).map(
                      (icon) => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.filterChip,
                            {
                              backgroundColor:
                                selectedZoneFilter === icon
                                  ? textColor
                                  : backgroundColor,
                              borderColor,
                            },
                          ]}
                          onPress={() =>
                            setSelectedZoneFilter(
                              selectedZoneFilter === icon ? null : icon
                            )
                          }
                        >
                          <IconSymbol
                            name={icon as any}
                            size={16}
                            color={
                              selectedZoneFilter === icon
                                ? backgroundColor
                                : textColor
                            }
                          />
                        </TouchableOpacity>
                      )
                    )}
                  </ScrollView>
                </View>
                <BlurView intensity={80} style={styles.searchInputBlur}>
                  <View
                    style={[
                      styles.searchInputContainer,
                      {
                        borderColor,
                      },
                    ]}
                  >
                    <IconSymbol
                      name="magnifyingglass"
                      size={18}
                      color={muteTextColor}
                    />
                    <TextInput
                      placeholder="Search location..."
                      placeholderTextColor={muteTextColor}
                      style={[styles.searchInput, { color: textColor }]}
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                    {isSearching && (
                      <ActivityIndicator size="small" color={textColor} />
                    )}
                    {searchQuery.length > 0 && !isSearching && (
                      <TouchableOpacity onPress={handleClearSearch}>
                        <IconSymbol
                          name="xmark"
                          size={18}
                          color={muteTextColor}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </BlurView>
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <View
                    style={[
                      styles.searchResultsContainer,
                      {
                        backgroundColor: backgroundColor,
                        borderColor,
                      },
                    ]}
                  >
                    <View style={styles.searchResultsHeader}>
                      <View style={styles.searchResultsHeaderLeft}>
                        <Text
                          style={[
                            styles.searchResultsCount,
                            { color: muteTextColor },
                          ]}
                        >
                          {searchResults.length} result
                          {searchResults.length !== 1 ? "s" : ""} found
                        </Text>
                        {mainLocationCoords && address && (
                          <Text
                            style={[
                              styles.referenceLocation,
                              { color: muteTextColor },
                            ]}
                            numberOfLines={1}
                          >
                            Near: {address}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={handleClearSearch}>
                        <Text
                          style={[styles.clearButton, { color: textColor }]}
                        >
                          Clear
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      style={styles.searchResultsList}
                      keyboardShouldPersistTaps="handled"
                    >
                      {searchResults.map((result, index) => (
                        <TouchableOpacity
                          key={result.id || index}
                          style={[
                            styles.searchResultItem,
                            index < searchResults.length - 1 && {
                              borderBottomWidth: 1,
                              borderBottomColor: borderColor + "30",
                            },
                          ]}
                          onPress={() => handleSelectSearchResult(result)}
                        >
                          <View
                            style={[
                              styles.searchResultIconContainer,
                              { backgroundColor: getPlaceColor(result) + "20" },
                            ]}
                          >
                            <IconSymbol
                              name={getPlaceIcon(result) as any}
                              size={20}
                              color={getPlaceColor(result)}
                            />
                          </View>
                          <View style={styles.searchResultTextContainer}>
                            <View style={styles.searchResultHeader}>
                              <Text
                                style={[
                                  styles.searchResultTitle,
                                  { color: textColor },
                                ]}
                                numberOfLines={1}
                              >
                                {result.name}
                              </Text>
                              {result.type && result.type !== "address" && (
                                <View
                                  style={[
                                    styles.typeBadge,
                                    {
                                      backgroundColor:
                                        getPlaceColor(result) + "20",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.typeBadgeText,
                                      { color: getPlaceColor(result) },
                                    ]}
                                  >
                                    {result.type}
                                  </Text>
                                </View>
                              )}
                            </View>
                            {result.address &&
                              result.address !== result.name && (
                                <Text
                                  style={[
                                    styles.searchResultAddress,
                                    { color: muteTextColor },
                                  ]}
                                  numberOfLines={2}
                                >
                                  {result.address}
                                </Text>
                              )}
                            {(result as any).distance !== undefined && (
                              <Text
                                style={[
                                  styles.distanceText,
                                  { color: muteTextColor },
                                ]}
                              >
                                {(result as any).distance < 1
                                  ? `${Math.round(
                                      (result as any).distance * 1000
                                    )}m away`
                                  : `${(result as any).distance.toFixed(
                                      1
                                    )}km away`}
                                {index === 0 && (
                                  <Text style={{ fontWeight: "600" }}>
                                    {" "}
                                    • Closest
                                  </Text>
                                )}
                              </Text>
                            )}
                          </View>
                          <IconSymbol
                            name="chevron.right"
                            size={16}
                            color={muteTextColor}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </>
          ) : (
            <ErrorState
              title="Location Error"
              message={locationError || "Unable to load map"}
              onRetry={fetchLocation}
              retryText="Retry"
            />
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
                  style={[styles.locationCard, { backgroundColor }]}
                  onPress={() => handlePreviousLocationPress(location.id)}
                  activeOpacity={0.9}
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
                      onPress={(e) => handleShareLocation(e, location.id)}
                    >
                      <IconSymbol
                        name="square.and.arrow.up"
                        size={16}
                        color="#000"
                      />
                    </TouchableOpacity>
                    {/* Content at bottom */}
                    <View
                      style={[styles.cardInfoContainer, { backgroundColor }]}
                    >
                      <Text style={[styles.cardAddress, { color: textColor }]}>
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
  searchContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  searchInputBlur: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  searchResultsContainer: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  searchResultsList: {
    maxHeight: 300,
  },
  searchResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchResultsHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  searchResultsCount: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  referenceLocation: {
    fontSize: 11,
    fontStyle: "italic",
  },
  clearButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingHorizontal: 20,
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultTextContainer: {
    flex: 1,
    gap: 4,
  },
  searchResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  searchResultAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  distanceText: {
    fontSize: 12,
    marginTop: 2,
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  cardInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  appleMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  appleMarkerOuterCircle: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(150, 150, 150, 0.5)",
  },
  appleMarkerInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF", // Apple Maps blue
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 44,
    height: 36,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
