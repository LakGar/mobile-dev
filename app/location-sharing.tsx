import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function LocationSharingScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [foregroundEnabled, setForegroundEnabled] = useState(false);
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [preciseLocation, setPreciseLocation] = useState(false);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);

  useEffect(() => {
    checkLocationStatus();
  }, []);

  const checkLocationStatus = async () => {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(servicesEnabled);

      if (servicesEnabled) {
        const { status } = await Location.getForegroundPermissionsAsync();
        setForegroundEnabled(status === "granted");

        const backgroundStatus = await Location.getBackgroundPermissionsAsync();
        setBackgroundEnabled(backgroundStatus.status === "granted");
      }
    } catch (error) {
      console.error("Error checking location status:", error);
    }
  };

  const handleForegroundToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setForegroundEnabled(true);
        Alert.alert("Success", "Foreground location permission granted");
      } else {
        Alert.alert(
          "Permission Denied",
          "Foreground location permission is required for zone tracking"
        );
      }
    } else {
      Alert.alert(
        "Disable Location",
        "Disabling location will prevent zone tracking. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => setForegroundEnabled(false),
          },
        ]
      );
    }
  };

  const handleBackgroundToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status === "granted") {
        setBackgroundEnabled(true);
        Alert.alert("Success", "Background location permission granted");
      } else {
        Alert.alert(
          "Permission Denied",
          "Background location permission is required for zone tracking when the app is closed"
        );
      }
    } else {
      setBackgroundEnabled(false);
    }
  };

  const handlePreciseLocationToggle = async (value: boolean) => {
    if (value && !foregroundEnabled) {
      Alert.alert(
        "Enable Foreground Location First",
        "Please enable foreground location permission first"
      );
      return;
    }
    setPreciseLocation(value);
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
        <ThemedText style={styles.headerTitle}>Location Sharing</ThemedText>
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
        {/* Status Card */}
        {!locationServicesEnabled && (
          <View style={[styles.warningCard, { backgroundColor: "#FF9800" + "20", borderColor: "#FF9800" }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9800" />
            <View style={styles.warningTextContainer}>
              <Text style={[styles.warningTitle, { color: "#FF9800" }]}>
                Location Services Disabled
              </Text>
              <Text style={[styles.warningText, { color: "#FF9800" }]}>
                Please enable location services in your device settings to use zone tracking.
              </Text>
            </View>
          </View>
        )}

        {/* Permissions */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: muteTextColor + "20" },
                ]}
              >
                <IconSymbol name="location.fill" size={20} color={textColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Foreground Location
                </Text>
                <Text style={[styles.settingSubtitle, { color: muteTextColor }]}>
                  Track location when app is open
                </Text>
              </View>
            </View>
            <Switch
              value={foregroundEnabled}
              onValueChange={handleForegroundToggle}
              trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
              thumbColor={foregroundEnabled ? textColor : muteTextColor}
              ios_backgroundColor={muteTextColor + "40"}
              disabled={!locationServicesEnabled}
            />
          </View>

          <View style={[styles.settingItem, { borderTopColor: borderColor, borderTopWidth: 1 }]}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: muteTextColor + "20" },
                ]}
              >
                <IconSymbol name="location.fill" size={20} color={textColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Background Location
                </Text>
                <Text style={[styles.settingSubtitle, { color: muteTextColor }]}>
                  Track location when app is closed
                </Text>
              </View>
            </View>
            <Switch
              value={backgroundEnabled}
              onValueChange={handleBackgroundToggle}
              trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
              thumbColor={backgroundEnabled ? textColor : muteTextColor}
              ios_backgroundColor={muteTextColor + "40"}
              disabled={!foregroundEnabled || !locationServicesEnabled}
            />
          </View>

          <View style={[styles.settingItem, { borderTopColor: borderColor, borderTopWidth: 1 }]}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: muteTextColor + "20" },
                ]}
              >
                <IconSymbol name="location.fill" size={20} color={textColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Precise Location
                </Text>
                <Text style={[styles.settingSubtitle, { color: muteTextColor }]}>
                  Use precise location for better accuracy
                </Text>
              </View>
            </View>
            <Switch
              value={preciseLocation}
              onValueChange={handlePreciseLocationToggle}
              trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
              thumbColor={preciseLocation ? textColor : muteTextColor}
              ios_backgroundColor={muteTextColor + "40"}
              disabled={!foregroundEnabled || !locationServicesEnabled}
            />
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: muteTextColor + "10" }]}>
          <IconSymbol name="info.circle.fill" size={20} color={muteTextColor} />
          <Text style={[styles.infoText, { color: muteTextColor }]}>
            Location data is used only for zone tracking and is stored locally on your device. We never share your location with third parties.
          </Text>
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
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

