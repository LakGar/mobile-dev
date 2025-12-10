import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useZoneStore } from "@/stores/useZoneStore";
import { NotificationOption } from "@/types";
import { useToast } from "@/components/ui/toast-provider";

export default function NotificationSettingsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { getZoneById, updateZone } = useZoneStore();
  const { showToast } = useToast();
  const zone = id ? getZoneById(parseInt(id)) : null;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationOption, setNotificationOption] =
    useState<NotificationOption>(zone?.notificationOption || "both");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    zone?.notificationText || ""
  );

  useEffect(() => {
    if (zone) {
      setNotificationOption(zone.notificationOption);
      setCustomMessage(zone.notificationText);
    }
  }, [zone]);

  const handleSave = () => {
    if (!zone) return;

    updateZone(zone.id, {
      notificationOption,
      notificationText: customMessage.trim() || "You have entered the zone",
    });

    showToast("Notification settings updated!");
    router.back();
  };

  if (!zone) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={muteTextColor} />
          <Text style={[styles.errorText, { color: textColor }]}>
            Zone not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { borderColor }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: textColor }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

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
        <ThemedText style={styles.headerTitle}>
          Notification Settings
        </ThemedText>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: textColor }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone Info */}
        <View style={[styles.zoneInfoCard, { backgroundColor, borderColor }]}>
          <View
            style={[
              styles.zoneIconContainer,
              { backgroundColor: zone.color + "20" },
            ]}
          >
            <IconSymbol name={zone.icon as any} size={24} color={zone.color} />
          </View>
          <View style={styles.zoneInfo}>
            <Text style={[styles.zoneTitle, { color: textColor }]}>
              {zone.title}
            </Text>
            <Text style={[styles.zoneAddress, { color: muteTextColor }]}>
              {zone.address}
            </Text>
          </View>
        </View>

        {/* Enable Notifications */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: muteTextColor + "20" },
                ]}
              >
                <IconSymbol name="bell.fill" size={20} color={textColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Enable Notifications
                </Text>
                <Text style={[styles.settingSubtitle, { color: muteTextColor }]}>
                  Receive notifications for this zone
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
              thumbColor={notificationsEnabled ? textColor : muteTextColor}
              ios_backgroundColor={muteTextColor + "40"}
            />
          </View>
        </View>

        {/* Notification Triggers */}
        {notificationsEnabled && (
          <View style={[styles.section, { backgroundColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Notification Triggers
            </Text>
            {(["enter", "exit", "both"] as NotificationOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  {
                    borderBottomColor: borderColor,
                  },
                ]}
                onPress={() => setNotificationOption(option)}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.radioButton,
                      {
                        borderColor:
                          notificationOption === option ? textColor : borderColor,
                      },
                    ]}
                  >
                    {notificationOption === option && (
                      <View
                        style={[
                          styles.radioButtonInner,
                          { backgroundColor: textColor },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, { color: textColor }]}>
                      {option === "enter"
                        ? "When Entering"
                        : option === "exit"
                          ? "When Exiting"
                          : "Both"}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: muteTextColor }]}>
                      {option === "enter"
                        ? "Notify when you enter this zone"
                        : option === "exit"
                          ? "Notify when you exit this zone"
                          : "Notify when entering or exiting"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Custom Message */}
        {notificationsEnabled && (
          <View style={[styles.section, { backgroundColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Custom Message
            </Text>
            <TextInput
              style={[
                styles.messageInput,
                { color: textColor, borderColor },
              ]}
              placeholder="You have entered the zone"
              placeholderTextColor={muteTextColor}
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={2}
            />
          </View>
        )}

        {/* Sound & Haptics */}
        {notificationsEnabled && (
          <View style={[styles.section, { backgroundColor, borderColor }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="speaker.wave.2.fill" size={20} color={textColor} />
                </View>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Sound
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
                thumbColor={soundEnabled ? textColor : muteTextColor}
                ios_backgroundColor={muteTextColor + "40"}
              />
            </View>
            <View
              style={[
                styles.settingItem,
                { borderTopColor: borderColor, borderTopWidth: 1 },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="hand.tap.fill" size={20} color={textColor} />
                </View>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Haptics
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
                thumbColor={hapticsEnabled ? textColor : muteTextColor}
                ios_backgroundColor={muteTextColor + "40"}
              />
            </View>
          </View>
        )}
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  zoneInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  zoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneInfo: {
    flex: 1,
    gap: 4,
  },
  zoneTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  zoneAddress: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    paddingBottom: 12,
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
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionSubtitle: {
    fontSize: 13,
  },
  messageInput: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 60,
  },
});

