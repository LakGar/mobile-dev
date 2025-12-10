import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function PrivacyPolicyScreen() {
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

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
        <ThemedText style={styles.headerTitle}>Privacy Policy</ThemedText>
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
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: muteTextColor }]}>
            Last updated: January 1, 2024
          </Text>

          <Section title="1. Information We Collect" color={textColor} muteColor={muteTextColor}>
            Zone collects the following types of information:
            {"\n\n"}
            • Location Data: We collect your location data to provide zone tracking functionality. This data is stored locally on your device.
            {"\n"}
            • Account Information: Email address, name, and profile information you provide.
            {"\n"}
            • Usage Data: Information about how you use the app to improve our services.
          </Section>

          <Section title="2. How We Use Your Information" color={textColor} muteColor={muteTextColor}>
            We use the information we collect to:
            {"\n\n"}
            • Provide and maintain Zone services
            {"\n"}
            • Send you notifications about zone activity
            {"\n"}
            • Improve and personalize your experience
            {"\n"}
            • Analyze usage patterns to enhance the app
          </Section>

          <Section title="3. Data Storage" color={textColor} muteColor={muteTextColor}>
            All location data and zone information is stored locally on your device using secure storage methods. We do not transmit your location data to our servers unless you explicitly enable cloud sync features.
          </Section>

          <Section title="4. Data Sharing" color={textColor} muteColor={muteTextColor}>
            We do not sell, trade, or rent your personal information to third parties. We may share information only:
            {"\n\n"}
            • With your explicit consent
            {"\n"}
            • To comply with legal obligations
            {"\n"}
            • To protect our rights and safety
          </Section>

          <Section title="5. Your Rights" color={textColor} muteColor={muteTextColor}>
            You have the right to:
            {"\n\n"}
            • Access your personal data
            {"\n"}
            • Request deletion of your data
            {"\n"}
            • Opt-out of data collection
            {"\n"}
            • Export your data
          </Section>

          <Section title="6. Security" color={textColor} muteColor={muteTextColor}>
            We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.
          </Section>

          <Section title="7. Children's Privacy" color={textColor} muteColor={muteTextColor}>
            Zone is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </Section>

          <Section title="8. Changes to This Policy" color={textColor} muteColor={muteTextColor}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </Section>

          <Section title="9. Contact Us" color={textColor} muteColor={muteTextColor}>
            If you have any questions about this Privacy Policy, please contact us at support@zoneapp.com
          </Section>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const Section = ({
  title,
  children,
  color,
  muteColor,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
  muteColor: string;
}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    <Text style={[styles.sectionText, { color: muteColor }]}>{children}</Text>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
});

