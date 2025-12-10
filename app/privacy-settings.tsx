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
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  showArrow = false,
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
            { backgroundColor: muteTextColor + "20" },
          ]}
        >
          <IconSymbol name={icon as any} size={20} color={textColor} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: textColor }]}>
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

export default function PrivacySettingsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const muteTextColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [zoneVisibility, setZoneVisibility] = useState(true);
  const [shareWithFriends, setShareWithFriends] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

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
        <ThemedText style={styles.headerTitle}>Privacy Settings</ThemedText>
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
        {/* Zone Visibility Section */}
        <SectionHeader title="Zone Visibility" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="eye.fill"
            title="Make Zones Visible"
            subtitle="Allow others to see your zones"
            value={zoneVisibility}
            onToggle={setZoneVisibility}
          />
          <SettingItem
            icon="square.and.arrow.up"
            title="Share with Friends"
            subtitle="Let friends see your zone activity"
            value={shareWithFriends}
            onToggle={setShareWithFriends}
          />
          <SettingItem
            icon="person.fill"
            title="Public Profile"
            subtitle="Make your profile discoverable"
            value={publicProfile}
            onToggle={setPublicProfile}
          />
        </View>

        {/* Data & Analytics Section */}
        <SectionHeader title="Data & Analytics" />
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <SettingItem
            icon="chart.bar.fill"
            title="Analytics"
            subtitle="Help improve the app with usage data"
            value={analyticsEnabled}
            onToggle={setAnalyticsEnabled}
          />
          <SettingItem
            icon="square.and.arrow.down.fill"
            title="Data Collection"
            subtitle="Allow collection of location data for features"
            value={dataCollection}
            onToggle={setDataCollection}
          />
        </View>

        {/* Information */}
        <View style={[styles.infoContainer, { backgroundColor: muteTextColor + "10" }]}>
          <IconSymbol
            name="info.circle.fill"
            size={20}
            color={muteTextColor}
          />
          <Text style={[styles.infoText, { color: muteTextColor }]}>
            Your location data is stored locally on your device. We respect your privacy and give you full control over your data.
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
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

