import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useZoneStore } from "@/stores/useZoneStore";
import { NotificationOption } from "@/types";
import { useToast } from "@/components/ui/toast-provider";

export default function ZoneQuickEditScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { getZoneById, updateZone } = useZoneStore();
  const { showToast } = useToast();
  const zone = id ? getZoneById(parseInt(id)) : null;

  const [title, setTitle] = useState(zone?.title || "");
  const [description, setDescription] = useState(zone?.description || "");
  const [radius, setRadius] = useState(zone?.radius.toString() || "200");
  const [notificationOption, setNotificationOption] =
    useState<NotificationOption>(zone?.notificationOption || "both");

  useEffect(() => {
    if (zone) {
      setTitle(zone.title);
      setDescription(zone.description || "");
      setRadius(zone.radius.toString());
      setNotificationOption(zone.notificationOption);
    }
  }, [zone]);

  const handleSave = () => {
    if (!zone || !title.trim()) return;

    updateZone(zone.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      radius: parseInt(radius) || 200,
      notificationOption,
    });

    showToast("Zone updated successfully!");
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
        <ThemedText style={styles.headerTitle}>Quick Edit</ThemedText>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: textColor }]}>
            Save
          </Text>
        </TouchableOpacity>
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
          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Title</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Zone title"
              placeholderTextColor={muteTextColor}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { color: textColor, borderColor }]}
              placeholder="Zone description (optional)"
              placeholderTextColor={muteTextColor}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Radius */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>
              Radius (meters)
            </Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="200"
              placeholderTextColor={muteTextColor}
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
            />
          </View>

          {/* Notification Option */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>
              Notifications
            </Text>
            <View style={styles.optionsContainer}>
              {(["enter", "exit", "both"] as NotificationOption[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        notificationOption === option ? textColor : backgroundColor,
                      borderColor,
                    },
                  ]}
                  onPress={() => setNotificationOption(option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      {
                        color:
                          notificationOption === option ? backgroundColor : textColor,
                      },
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.fullEditButton, { borderColor }]}
            onPress={() => router.push(`/zone-detail?id=${zone.id}`)}
          >
            <Text style={[styles.fullEditButtonText, { color: textColor }]}>
              Full Edit
            </Text>
            <IconSymbol name="chevron.right" size={20} color={textColor} />
          </TouchableOpacity>
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  section: {
    marginHorizontal: 16,
    marginTop: 20,
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
    minHeight: 80,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fullEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fullEditButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

