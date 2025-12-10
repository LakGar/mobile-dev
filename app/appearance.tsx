import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore, ThemeMode } from "@/stores/useThemeStore";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedText } from "@/components/themed-text";

export default function AppearanceScreen() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();

  const { themeMode, setThemeMode } = useThemeStore();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(themeMode);

  useEffect(() => {
    setSelectedMode(themeMode);
  }, [themeMode]);

  const handleSelectMode = async (mode: ThemeMode) => {
    setSelectedMode(mode);
    await setThemeMode(mode);
  };

  const getEffectiveTheme = (): "light" | "dark" => {
    if (selectedMode === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return selectedMode;
  };

  const effectiveTheme = getEffectiveTheme();

  const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: "light", label: "Light", icon: "sun.max.fill" },
    { mode: "dark", label: "Dark", icon: "moon.fill" },
    { mode: "system", label: "System", icon: "gearshape.fill" },
  ];

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
        <ThemedText style={styles.headerTitle}>Appearance</ThemedText>
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
        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Preview
          </Text>
          <View
            style={[
              styles.previewContainer,
              {
                backgroundColor: effectiveTheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: effectiveTheme === "dark" ? "#2a2a2a" : "#fff",
                },
              ]}
            >
              <View
                style={[
                  styles.previewHeader,
                  {
                    borderBottomColor:
                      effectiveTheme === "dark" ? "#3a3a3a" : "#e0e0e0",
                  },
                ]}
              >
                <View
                  style={[
                    styles.previewAvatar,
                    {
                      backgroundColor:
                        effectiveTheme === "dark" ? "#3a3a3a" : "#e0e0e0",
                    },
                  ]}
                />
                <View style={styles.previewTextContainer}>
                  <View
                    style={[
                      styles.previewTextLine,
                      {
                        backgroundColor:
                          effectiveTheme === "dark" ? "#3a3a3a" : "#e0e0e0",
                        width: "60%",
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewTextLine,
                      {
                        backgroundColor:
                          effectiveTheme === "dark" ? "#3a3a3a" : "#e0e0e0",
                        width: "40%",
                        marginTop: 8,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.previewContent}>
                <View
                  style={[
                    styles.previewTextLine,
                    {
                      backgroundColor:
                        effectiveTheme === "dark" ? "#3a3a3a" : "#e0e0e0",
                      width: "100%",
                      marginTop: 12,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.previewTextLine,
                    {
                      backgroundColor:
                        effectiveTheme === "dark" ? "#3a3a3a" : "#e0e0e0",
                      width: "80%",
                      marginTop: 8,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Theme
          </Text>
          <View style={[styles.optionsContainer, { backgroundColor, borderColor }]}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.optionItem,
                  {
                    borderBottomColor: borderColor + "30",
                    backgroundColor:
                      selectedMode === option.mode
                        ? borderColor + "10"
                        : "transparent",
                  },
                  option.mode === themeOptions[themeOptions.length - 1].mode && {
                    borderBottomWidth: 0,
                  },
                ]}
                onPress={() => handleSelectMode(option.mode)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.optionIconContainer,
                      {
                        backgroundColor:
                          selectedMode === option.mode
                            ? textColor + "20"
                            : muteTextColor + "20",
                      },
                    ]}
                  >
                    <IconSymbol
                      name={option.icon as any}
                      size={20}
                      color={
                        selectedMode === option.mode ? textColor : muteTextColor
                      }
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color:
                            selectedMode === option.mode ? textColor : muteTextColor,
                          fontWeight: selectedMode === option.mode ? "600" : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.mode === "system" && (
                      <Text
                        style={[styles.optionSubtitle, { color: muteTextColor }]}
                      >
                        Follows your device settings
                      </Text>
                    )}
                  </View>
                </View>
                {selectedMode === option.mode && (
                  <IconSymbol name="checkmark" size={20} color={textColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  previewSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTextLine: {
    height: 12,
    borderRadius: 6,
  },
  previewContent: {
    paddingTop: 12,
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

