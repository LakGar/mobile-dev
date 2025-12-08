import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
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

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  showArrow?: boolean;
  destructive?: boolean;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  showArrow = false,
  destructive = false,
}: SettingItemProps) => {
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");

  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: borderColor }]}
      onPress={onPress}
      disabled={!onPress && !onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: destructive ? "#FF3B30" + "20" : muteTextColor + "20" },
          ]}
        >
          <IconSymbol
            name={icon as any}
            size={20}
            color={destructive ? "#FF3B30" : textColor}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              { color: destructive ? "#FF3B30" : textColor },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: muteTextColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {onToggle !== undefined && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: muteTextColor + "40", true: textColor + "40" }}
            thumbColor={value ? textColor : muteTextColor}
            ios_backgroundColor={muteTextColor + "40"}
          />
        )}
        {showArrow && (
          <IconSymbol name="chevron.right" size={20} color={muteTextColor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title }: { title: string }) => {
  const muteTextColor = useThemeColor({}, "muteText");

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: muteTextColor }]}>
        {title}
      </Text>
    </View>
  );
};

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [backgroundLocation, setBackgroundLocation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

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
          <IconSymbol name="chevron.left" size={24} color={useThemeColor({}, "text")} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
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
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="person.fill"
            title="Edit Profile"
            onPress={() => router.push("/edit-profile")}
            showArrow
          />
          <SettingItem
            icon="lock.fill"
            title="Change Password"
            showArrow
          />
          <SettingItem
            icon="envelope.fill"
            title="Email & Phone"
            subtitle="Manage contact information"
            showArrow
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="bell.fill"
            title="Push Notifications"
            subtitle="Receive notifications about zone activity"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <SettingItem
            icon="location.fill"
            title="Location Notifications"
            subtitle="Get notified when entering or exiting zones"
            value={locationEnabled}
            onToggle={setLocationEnabled}
          />
          <SettingItem
            icon="location.fill"
            title="Background Location"
            subtitle="Track location even when app is closed"
            value={backgroundLocation}
            onToggle={setBackgroundLocation}
          />
          <SettingItem
            icon="speaker.wave.2.fill"
            title="Sound"
            subtitle="Play sound for notifications"
            value={soundEnabled}
            onToggle={setSoundEnabled}
          />
          <SettingItem
            icon="hand.tap.fill"
            title="Haptics"
            subtitle="Vibrate for notifications"
            value={hapticsEnabled}
            onToggle={setHapticsEnabled}
          />
        </View>

        {/* Privacy & Security Section */}
        <SectionHeader title="Privacy & Security" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="lock.shield.fill"
            title="Privacy Settings"
            subtitle="Control who can see your zones"
            showArrow
          />
          <SettingItem
            icon="eye.fill"
            title="Location Sharing"
            subtitle="Manage location sharing preferences"
            showArrow
          />
          <SettingItem
            icon="key.fill"
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            showArrow
          />
        </View>

        {/* App Settings Section */}
        <SectionHeader title="App Settings" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="moon.fill"
            title="Appearance"
            subtitle="Light, Dark, or System"
            showArrow
          />
          <SettingItem
            icon="globe"
            title="Language"
            subtitle="English"
            showArrow
          />
          <SettingItem
            icon="square.and.arrow.down.fill"
            title="Data & Storage"
            subtitle="Manage cache and downloads"
            showArrow
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="questionmark.circle.fill"
            title="Help Center"
            showArrow
          />
          <SettingItem
            icon="envelope.fill"
            title="Contact Us"
            showArrow
          />
          <SettingItem
            icon="doc.text.fill"
            title="Terms of Service"
            showArrow
          />
          <SettingItem
            icon="hand.raised.fill"
            title="Privacy Policy"
            showArrow
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="info.circle.fill"
            title="App Version"
            subtitle="1.0.0"
          />
          <SettingItem
            icon="star.fill"
            title="Rate App"
            showArrow
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="trash.fill"
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            destructive
            showArrow
          />
          <SettingItem
            icon="arrow.clockwise"
            title="Reset All Settings"
            subtitle="Reset all app settings to default"
            destructive
            showArrow
          />
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
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
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

