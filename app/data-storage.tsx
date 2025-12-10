import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function DataStorageScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);

  // Mock storage data
  const storageData = {
    appSize: "45.2 MB",
    cacheSize: "12.8 MB",
    documentsSize: "28.4 MB",
    totalSize: "86.4 MB",
  };

  const handleClearCache = () => {
    // Clear cache logic here
    setShowClearCacheDialog(false);
  };

  const handleClearAllData = () => {
    // Clear all data logic here
    setShowClearDataDialog(false);
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
        <ThemedText style={styles.headerTitle}>Data & Storage</ThemedText>
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
        {/* Storage Usage */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <View style={styles.storageHeader}>
            <Text style={[styles.storageTitle, { color: textColor }]}>
              Storage Usage
            </Text>
            <Text style={[styles.storageTotal, { color: muteTextColor }]}>
              {storageData.totalSize}
            </Text>
          </View>
          <View style={styles.storageBreakdown}>
            <View style={styles.storageItem}>
              <View style={styles.storageItemLeft}>
                <View
                  style={[
                    styles.storageIcon,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="doc.text.fill" size={16} color={textColor} />
                </View>
                <Text style={[styles.storageLabel, { color: textColor }]}>
                  App Size
                </Text>
              </View>
              <Text style={[styles.storageValue, { color: muteTextColor }]}>
                {storageData.appSize}
              </Text>
            </View>
            <View style={styles.storageItem}>
              <View style={styles.storageItemLeft}>
                <View
                  style={[
                    styles.storageIcon,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="square.and.arrow.down.fill" size={16} color={textColor} />
                </View>
                <Text style={[styles.storageLabel, { color: textColor }]}>
                  Cache
                </Text>
              </View>
              <Text style={[styles.storageValue, { color: muteTextColor }]}>
                {storageData.cacheSize}
              </Text>
            </View>
            <View style={styles.storageItem}>
              <View style={styles.storageItemLeft}>
                <View
                  style={[
                    styles.storageIcon,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="folder.fill" size={16} color={textColor} />
                </View>
                <Text style={[styles.storageLabel, { color: textColor }]}>
                  Documents
                </Text>
              </View>
              <Text style={[styles.storageValue, { color: muteTextColor }]}>
                {storageData.documentsSize}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor, borderColor }]}>
          <TouchableOpacity
            style={[
              styles.actionItem,
              { borderBottomColor: borderColor },
            ]}
            onPress={() => setShowClearCacheDialog(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: muteTextColor + "20" },
                ]}
              >
                <IconSymbol name="trash.fill" size={20} color={textColor} />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: textColor }]}>
                  Clear Cache
                </Text>
                <Text style={[styles.actionSubtitle, { color: muteTextColor }]}>
                  Free up {storageData.cacheSize} of storage
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={muteTextColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setShowClearDataDialog(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "#FF3B30" + "20" },
                ]}
              >
                <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: "#FF3B30" }]}>
                  Clear All Data
                </Text>
                <Text style={[styles.actionSubtitle, { color: muteTextColor }]}>
                  Delete all app data and reset to defaults
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={muteTextColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteConfirmationDialog
        visible={showClearCacheDialog}
        title="Clear Cache"
        message={`This will clear ${storageData.cacheSize} of cached data. Your zones and settings will not be affected.`}
        confirmText="Clear Cache"
        cancelText="Cancel"
        onConfirm={handleClearCache}
        onCancel={() => setShowClearCacheDialog(false)}
      />

      <DeleteConfirmationDialog
        visible={showClearDataDialog}
        title="Clear All Data"
        message="This will delete all app data including zones, settings, and preferences. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearDataDialog(false)}
        destructive
      />
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
  section: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  storageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  storageTotal: {
    fontSize: 16,
    fontWeight: "700",
  },
  storageBreakdown: {
    padding: 16,
    gap: 16,
  },
  storageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storageItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  storageIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  storageLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  storageValue: {
    fontSize: 15,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  actionLeft: {
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
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

