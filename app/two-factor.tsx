import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function TwoFactorScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);

  const handleToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Enable Two-Factor Authentication",
        "You'll need to verify your identity using an authenticator app. Do you want to continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              setTwoFactorEnabled(true);
              Alert.alert(
                "Setup Required",
                "Please download an authenticator app (like Google Authenticator) and scan the QR code that will be shown."
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Disable Two-Factor Authentication",
        "Are you sure you want to disable two-factor authentication? This will make your account less secure.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => setTwoFactorEnabled(false),
          },
        ]
      );
    }
  };

  const handleGenerateBackupCodes = () => {
    Alert.alert(
      "Generate Backup Codes",
      "Backup codes can be used to access your account if you lose access to your authenticator app. Save these codes in a safe place.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => {
            setBackupCodesGenerated(true);
            Alert.alert(
              "Backup Codes Generated",
              "Your backup codes have been generated. Please save them in a secure location."
            );
          },
        },
      ]
    );
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
        <ThemedText style={styles.headerTitle}>
          Two-Factor Authentication
        </ThemedText>
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
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
          <IconSymbol name="lock.shield.fill" size={24} color={textColor} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: textColor }]}>
              Enhanced Security
            </Text>
            <Text style={[styles.infoText, { color: muteTextColor }]}>
              Two-factor authentication adds an extra layer of security to your
              account by requiring a verification code in addition to your
              password.
            </Text>
          </View>
        </View>

        {/* Main Toggle */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: muteTextColor + "20" },
                ]}
              >
                <IconSymbol name="key.fill" size={20} color={textColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Two-Factor Authentication
                </Text>
                <Text
                  style={[styles.settingSubtitle, { color: muteTextColor }]}
                >
                  {twoFactorEnabled
                    ? "Enabled - Your account is protected"
                    : "Disabled - Enable for better security"}
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle}
              trackColor={{
                false: muteTextColor + "40",
                true: textColor + "40",
              }}
              thumbColor={twoFactorEnabled ? textColor : muteTextColor}
              ios_backgroundColor={muteTextColor + "40"}
            />
          </View>
        </View>

        {/* Setup Steps */}
        {twoFactorEnabled && (
          <View style={styles.setupSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Setup Steps
            </Text>
            <View style={[styles.stepsCard, { backgroundColor, borderColor }]}>
              <StepItem
                number={1}
                title="Download Authenticator App"
                description="Install Google Authenticator or similar app"
                color={textColor}
                muteColor={muteTextColor}
              />
              <StepItem
                number={2}
                title="Scan QR Code"
                description="Scan the QR code shown in the app"
                color={textColor}
                muteColor={muteTextColor}
              />
              <StepItem
                number={3}
                title="Enter Verification Code"
                description="Enter the 6-digit code from your app"
                color={textColor}
                muteColor={muteTextColor}
              />
            </View>
          </View>
        )}

        {/* Backup Codes */}
        {twoFactorEnabled && (
          <View style={[styles.section, { backgroundColor, borderColor }]}>
            <TouchableOpacity
              style={styles.backupCodeItem}
              onPress={handleGenerateBackupCodes}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="key.fill" size={20} color={textColor} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: textColor }]}>
                    Backup Codes
                  </Text>
                  <Text
                    style={[styles.settingSubtitle, { color: muteTextColor }]}
                  >
                    {backupCodesGenerated
                      ? "Generated - Save them securely"
                      : "Generate codes for account recovery"}
                  </Text>
                </View>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={muteTextColor}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const StepItem = ({
  number,
  title,
  description,
  color,
  muteColor,
}: {
  number: number;
  title: string;
  description: string;
  color: string;
  muteColor: string;
}) => (
  <View style={styles.stepItem}>
    <View style={[styles.stepNumber, { backgroundColor: muteColor + "20" }]}>
      <Text style={[styles.stepNumberText, { color }]}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color }]}>{title}</Text>
      <Text style={[styles.stepDescription, { color: muteColor }]}>
        {description}
      </Text>
    </View>
  </View>
);

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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
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
  setupSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  stepsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  stepDescription: {
    fontSize: 13,
  },
  backupCodeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
});
