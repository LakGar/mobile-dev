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

export default function ContactUsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    Alert.alert(
      "Message Sent",
      "Thank you for contacting us! We'll get back to you soon.",
      [
        {
          text: "OK",
          onPress: () => {
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
            router.back();
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
        <ThemedText style={styles.headerTitle}>Contact Us</ThemedText>
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
          {/* Contact Info */}
          <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
            <View style={styles.infoItem}>
              <IconSymbol name="envelope.fill" size={20} color={textColor} />
              <Text style={[styles.infoText, { color: textColor }]}>
                support@zoneapp.com
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="phone.fill" size={20} color={textColor} />
              <Text style={[styles.infoText, { color: textColor }]}>
                +1 (555) 123-4567
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="clock" size={20} color={textColor} />
              <Text style={[styles.infoText, { color: textColor }]}>
                Mon-Fri, 9AM-5PM PST
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Send us a message
            </Text>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Your name"
                placeholderTextColor={muteTextColor}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="your.email@example.com"
                placeholderTextColor={muteTextColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>Subject</Text>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="What can we help you with?"
                placeholderTextColor={muteTextColor}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Text style={[styles.label, { color: textColor }]}>Message</Text>
              <TextInput
                style={[styles.textArea, { color: textColor }]}
                placeholder="Tell us more about your question..."
                placeholderTextColor={muteTextColor}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
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
                {isSubmitting ? "Sending..." : "Send Message"}
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
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "500",
  },
  formSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
    minHeight: 120,
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

