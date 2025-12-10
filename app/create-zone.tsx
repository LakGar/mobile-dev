import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/ui/toast-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useZoneStore } from "@/stores/useZoneStore";
import { NotificationOption } from "@/types";
import { Place, searchPlacesEnhanced } from "@/utils/places";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

const ZONE_COLORS = ["#ebecf8", "#fef4ec", "#ddf5ff", "#ecfaf0"];
const ZONE_ICONS = [
  "house.fill",
  "location.fill",
  "map.fill",
  "mappin.circle.fill",
  "figure.run",
  "cup.and.saucer.fill",
  "tree.fill",
  "car.fill",
];

export default function CreateZoneModal() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "muteText");
  const backgroundColor = useThemeColor({}, "background");
  const insets = useSafeAreaInsets();

  const { addZone } = useZoneStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [radius, setRadius] = useState("200");
  const [selectedIcon, setSelectedIcon] = useState(ZONE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(ZONE_COLORS[0]);
  const [notificationOption, setNotificationOption] =
    useState<NotificationOption>("both");
  const [notificationText, setNotificationText] = useState(
    "You have entered the zone"
  );
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mapRef = React.useRef<MapView>(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        opacity.value = 1 - event.translationY / 400;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withSpring(1000);
        opacity.value = withSpring(0, {}, () => {
          runOnJS(router.back)();
        });
      } else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const fetchCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);

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
      } catch {
        setAddress(
          `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesEnhanced(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSearchResult = async (place: Place) => {
    setLocation({ latitude: place.latitude, longitude: place.longitude });
    setAddress(place.address);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });

    // Reverse geocode
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
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
        setAddress(fullAddress || `${addr.city || ""}, ${addr.region || ""}`);
      }
    } catch {
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const { showToast } = useToast();

  const captureMapSnapshot = async (): Promise<string | null> => {
    if (!mapRef.current || !location) {
      return null;
    }

    try {
      // Wait for map to fully render
      await new Promise((resolve) => setTimeout(resolve, 800));

      const snapshot = await mapRef.current.takeSnapshot({
        width: 400,
        height: 300,
        format: "png",
        quality: 1.0,
        result: "file",
      });

      return snapshot;
    } catch (error) {
      console.error("Error capturing map snapshot:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !location) {
      showToast("Please enter a title and select a location.");
      return;
    }

    setIsSaving(true);
    try {
      // Capture map screenshot
      const mapImageUri = await captureMapSnapshot();

      const locationParts = address.split(", ");
      const streetAddress = locationParts[0] || address;
      const cityState = locationParts.slice(1).join(", ") || address;

      addZone({
        title: title.trim(),
        address: streetAddress,
        location: cityState,
        latitude: location.latitude,
        longitude: location.longitude,
        radius: parseInt(radius) || 200,
        icon: selectedIcon,
        color: selectedColor,
        description: description.trim() || undefined,
        notificationOption,
        notificationText:
          notificationText.trim() || "You have entered the zone",
        image: mapImageUri
          ? { uri: mapImageUri }
          : require("@/assets/images/map.png"),
      });

      showToast("Zone created successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving zone:", error);
      showToast("Failed to create zone.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemedView style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.modalContent, { backgroundColor }, animatedStyle]}
          >
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View
                style={[styles.handle, { backgroundColor: muteTextColor }]}
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={textColor} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Create Zone
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
                disabled={!title.trim() || !location || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: textColor }]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoid}
              keyboardVerticalOffset={insets.top}
            >
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + 40 },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Search Bar */}
                <View style={styles.searchSection}>
                  <View style={[styles.searchContainer, { borderColor }]}>
                    <IconSymbol
                      name="magnifyingglass"
                      size={18}
                      color={muteTextColor}
                    />
                    <TextInput
                      style={[styles.searchInput, { color: textColor }]}
                      placeholder="Search for a location..."
                      placeholderTextColor={muteTextColor}
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                    {isSearching && (
                      <ActivityIndicator size="small" color={textColor} />
                    )}
                    {searchQuery.length > 0 && !isSearching && (
                      <TouchableOpacity
                        onPress={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }}
                      >
                        <IconSymbol
                          name="xmark"
                          size={18}
                          color={muteTextColor}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <View
                      style={[
                        styles.searchResultsContainer,
                        { backgroundColor, borderColor },
                      ]}
                    >
                      {searchResults.map((result) => (
                        <TouchableOpacity
                          key={result.id}
                          style={styles.searchResultItem}
                          onPress={() => handleSelectSearchResult(result)}
                        >
                          <IconSymbol
                            name="mappin.circle.fill"
                            size={20}
                            color={textColor}
                          />
                          <View style={styles.searchResultText}>
                            <Text
                              style={[
                                styles.searchResultTitle,
                                { color: textColor },
                              ]}
                            >
                              {result.name}
                            </Text>
                            <Text
                              style={[
                                styles.searchResultAddress,
                                { color: muteTextColor },
                              ]}
                              numberOfLines={1}
                            >
                              {result.address}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Location Buttons */}
                  <View style={styles.locationButtons}>
                    <TouchableOpacity
                      style={[styles.locationButton, { borderColor }]}
                      onPress={fetchCurrentLocation}
                    >
                      <IconSymbol
                        name="location.fill"
                        size={18}
                        color={textColor}
                      />
                      <Text
                        style={[
                          styles.locationButtonText,
                          { color: textColor },
                        ]}
                      >
                        Use Current Location
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.orText, { color: muteTextColor }]}>
                      or
                    </Text>
                    <Text
                      style={[styles.instructionText, { color: muteTextColor }]}
                    >
                      Tap on the map to select a location
                    </Text>
                  </View>
                </View>

                {/* Map View */}
                <View style={styles.mapContainer}>
                  {location ? (
                    <MapView
                      ref={mapRef}
                      style={styles.map}
                      initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      onPress={handleMapPress}
                      mapType="standard"
                    >
                      <Marker
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        draggable
                        onDragEnd={handleMapPress}
                        anchor={{ x: 0.5, y: 0.5 }}
                        tracksViewChanges={true}
                      >
                        <View
                          style={styles.markerContainer}
                          collapsable={false}
                        >
                          <View
                            style={[
                              styles.markerCircle,
                              { backgroundColor: selectedColor },
                            ]}
                            collapsable={false}
                          >
                            <IconSymbol
                              name={selectedIcon as any}
                              size={24}
                              color="#000000"
                            />
                          </View>
                        </View>
                      </Marker>
                      <Circle
                        center={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        radius={parseInt(radius) || 200}
                        strokeWidth={3}
                        strokeColor={selectedColor}
                        fillColor={selectedColor + "30"}
                      />
                    </MapView>
                  ) : (
                    <View style={styles.emptyMapContainer}>
                      <IconSymbol
                        name="mappin.slash"
                        size={48}
                        color={muteTextColor}
                      />
                      <Text
                        style={[styles.emptyMapText, { color: muteTextColor }]}
                      >
                        Search for a location or use your current location
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Title *
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter zone title"
                    placeholderTextColor={muteTextColor}
                  />
                </View>

                {/* Description */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Description
                  </Text>
                  <TextInput
                    style={[styles.textArea, { color: textColor, borderColor }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description"
                    placeholderTextColor={muteTextColor}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Address */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Address
                  </Text>
                  <View style={styles.valueContainer}>
                    <IconSymbol
                      name="mappin.circle.fill"
                      size={16}
                      color={muteTextColor}
                    />
                    <Text style={[styles.valueText, { color: textColor }]}>
                      {address || "Tap map to select location"}
                    </Text>
                  </View>
                </View>

                {/* Radius */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Radius (meters)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={radius}
                    onChangeText={setRadius}
                    placeholder="200"
                    placeholderTextColor={muteTextColor}
                    keyboardType="numeric"
                  />
                </View>

                {/* Icon Selection */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Icon
                  </Text>
                  <View style={styles.iconGrid}>
                    {ZONE_ICONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        onPress={() => setSelectedIcon(icon)}
                        style={[
                          styles.iconOption,
                          selectedIcon === icon && {
                            backgroundColor: borderColor + "30",
                            borderColor,
                          },
                          { borderColor },
                        ]}
                      >
                        <IconSymbol
                          name={icon as any}
                          size={24}
                          color={
                            selectedIcon === icon ? textColor : muteTextColor
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Color Selection */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Color
                  </Text>
                  <View style={styles.colorGrid}>
                    {ZONE_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color,
                            borderColor:
                              selectedColor === color ? textColor : borderColor,
                            borderWidth: selectedColor === color ? 3 : 1,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* Notification Options */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Notification Trigger
                  </Text>
                  <View style={styles.optionsContainer}>
                    {(["enter", "exit", "both"] as NotificationOption[]).map(
                      (option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => setNotificationOption(option)}
                          style={[
                            styles.optionButton,
                            notificationOption === option && {
                              backgroundColor: borderColor + "30",
                              borderColor,
                            },
                            { borderColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color:
                                  notificationOption === option
                                    ? textColor
                                    : muteTextColor,
                              },
                            ]}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Notification Text */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Notification Text
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={notificationText}
                    onChangeText={setNotificationText}
                    placeholder="Enter notification text"
                    placeholderTextColor={muteTextColor}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: 50,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: "100%",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveButton: {
    padding: 8,
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  keyboardAvoid: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  searchSection: {
    marginBottom: 16,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResultsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  searchResultText: {
    flex: 1,
    gap: 4,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  searchResultAddress: {
    fontSize: 13,
  },
  locationButtons: {
    marginTop: 12,
    alignItems: "center",
    gap: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  orText: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  instructionText: {
    fontSize: 12,
    textAlign: "center",
  },
  mapContainer: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  emptyMapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyMapText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
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
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    overflow: "visible",
  },
  markerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  section: {
    marginBottom: 24,
    width: "100%",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  valueText: {
    fontSize: 16,
    flex: 1,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: "row",
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
