import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function DeleteAccountScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const requiredText = "DELETE";

  const handleContinue = () => {
    if (confirmationText !== requiredText) {
      Alert.alert("Error", `Please type "${requiredText}" to confirm`);
      return;
    }
    setStep(2);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Final Confirmation",
      "This action cannot be undone. All your data including zones, settings, and activity will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            // Delete account logic here
            Alert.alert(
              "Account Deleted",
              "Your account has been permanently deleted.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.replace("/(tabs)");
                  },
                },
              ]
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
        <ThemedText style={styles.headerTitle}>Delete Account</ThemedText>
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
        {step === 1 ? (
          <>
            {/* Warning Card */}
            <View style={[styles.warningCard, { backgroundColor: "#FF3B30" + "20", borderColor: "#FF3B30" }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#FF3B30" />
              <View style={styles.warningTextContainer}>
                <Text style={[styles.warningTitle, { color: "#FF3B30" }]}>
                  Warning: This action is permanent
                </Text>
                <Text style={[styles.warningText, { color: "#FF3B30" }]}>
                  Deleting your account will permanently remove all your data and cannot be undone.
                </Text>
              </View>
            </View>

            {/* What will be deleted */}
            <View style={[styles.section, { backgroundColor, borderColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                What will be deleted:
              </Text>
              <View style={styles.deletedItems}>
                {[
                  "All your zones",
                  "Zone activity history",
                  "Settings and preferences",
                  "Profile information",
                  "All associated data",
                ].map((item, index) => (
                  <View key={index} style={styles.deletedItem}>
                    <IconSymbol name="trash.fill" size={16} color="#FF3B30" />
                    <Text style={[styles.deletedItemText, { color: textColor }]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Confirmation */}
            <View style={[styles.section, { backgroundColor, borderColor }]}>
              <Text style={[styles.confirmationTitle, { color: textColor }]}>
                Type "{requiredText}" to confirm
              </Text>
              <TextInput
                style={[
                  styles.confirmationInput,
                  { color: textColor, borderColor },
                  confirmationText === requiredText && styles.confirmationInputValid,
                ]}
                placeholder={requiredText}
                placeholderTextColor={muteTextColor}
                value={confirmationText}
                onChangeText={setConfirmationText}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: confirmationText === requiredText ? "#FF3B30" : muteTextColor + "40",
                },
              ]}
              onPress={handleContinue}
              disabled={confirmationText !== requiredText}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Final Warning */}
            <View style={[styles.finalWarningCard, { backgroundColor, borderColor: "#FF3B30" }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#FF3B30" />
              <Text style={[styles.finalWarningTitle, { color: "#FF3B30" }]}>
                Are you absolutely sure?
              </Text>
              <Text style={[styles.finalWarningText, { color: muteTextColor }]}>
                This is your last chance to cancel. Once you delete your account, there is no way to recover your data.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: "#FF3B30" }]}
              onPress={handleDeleteAccount}
            >
              <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete My Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor }]}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
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
    borderWidth: 2,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  deletedItems: {
    gap: 12,
  },
  deletedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deletedItemText: {
    fontSize: 15,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  confirmationInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 2,
  },
  confirmationInputValid: {
    borderColor: "#FF3B30",
  },
  continueButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  finalWarningCard: {
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  finalWarningTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  finalWarningText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

