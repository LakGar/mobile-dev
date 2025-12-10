import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TermsScreen() {
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
        <ThemedText style={styles.headerTitle}>Terms of Service</ThemedText>
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

          <Section title="1. Acceptance of Terms" color={textColor} muteColor={muteTextColor}>
            By accessing and using Zone, you accept and agree to be bound by the terms and provision of this agreement.
          </Section>

          <Section title="2. Use License" color={textColor} muteColor={muteTextColor}>
            Permission is granted to temporarily use Zone for personal, non-commercial purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:
            {"\n\n"}
            • Modify or copy the materials
            {"\n"}
            • Use the materials for any commercial purpose
            {"\n"}
            • Attempt to decompile or reverse engineer any software
            {"\n"}
            • Remove any copyright or other proprietary notations
          </Section>

          <Section title="3. Location Services" color={textColor} muteColor={muteTextColor}>
            Zone requires access to your location to provide core functionality. All location data is stored locally on your device. We do not share your location data with third parties without your explicit consent.
          </Section>

          <Section title="4. User Accounts" color={textColor} muteColor={muteTextColor}>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </Section>

          <Section title="5. Privacy" color={textColor} muteColor={muteTextColor}>
            Your use of Zone is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </Section>

          <Section title="6. Limitations" color={textColor} muteColor={muteTextColor}>
            In no event shall Zone or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Zone.
          </Section>

          <Section title="7. Revisions" color={textColor} muteColor={muteTextColor}>
            Zone may revise these terms of service at any time without notice. By using Zone you are agreeing to be bound by the then current version of these terms of service.
          </Section>

          <Section title="8. Contact Information" color={textColor} muteColor={muteTextColor}>
            If you have any questions about these Terms of Service, please contact us at support@zoneapp.com
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

