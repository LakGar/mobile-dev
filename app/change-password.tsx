import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function ChangePasswordScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      Alert.alert("Invalid Password", validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    Alert.alert("Success", "Your password has been changed successfully", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
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
        <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security Info */}
          <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
            <IconSymbol name="lock.shield.fill" size={24} color={textColor} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTitle, { color: textColor }]}>
                Password Requirements
              </Text>
              <Text style={[styles.infoText, { color: muteTextColor }]}>
                • At least 8 characters
                {"\n"}
                • One uppercase letter
                {"\n"}
                • One lowercase letter
                {"\n"}
                • One number
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>
                Current Password
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { color: textColor }]}
                  placeholder="Enter current password"
                  placeholderTextColor={muteTextColor}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <IconSymbol
                    name={showCurrentPassword ? "eye.fill" : "eye.fill"}
                    size={20}
                    color={muteTextColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>
                New Password
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { color: textColor }]}
                  placeholder="Enter new password"
                  placeholderTextColor={muteTextColor}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <IconSymbol
                    name={showNewPassword ? "eye.fill" : "eye.fill"}
                    size={20}
                    color={muteTextColor}
                  />
                </TouchableOpacity>
              </View>
              {newPassword && validatePassword(newPassword) && (
                <Text style={[styles.errorText, { color: "#FF3B30" }]}>
                  {validatePassword(newPassword)}
                </Text>
              )}
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>
                Confirm New Password
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { color: textColor }]}
                  placeholder="Confirm new password"
                  placeholderTextColor={muteTextColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <IconSymbol
                    name={showConfirmPassword ? "eye.fill" : "eye.fill"}
                    size={20}
                    color={muteTextColor}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={[styles.errorText, { color: "#FF3B30" }]}>
                  Passwords do not match
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: textColor },
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  { color: backgroundColor },
                ]}
              >
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  formSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

