import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/ui/toast-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useZoneStore } from "@/stores/useZoneStore";
import { NotificationOption } from "@/types";
import { shareZone } from "@/utils/share";
import { Image } from "expo-image";
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
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ZoneDetailModal() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "muteText");
  const backgroundColor = useThemeColor({}, "background");
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { getZoneById, updateZone, deleteZone } = useZoneStore();
  const zone = id ? getZoneById(parseInt(id)) : null;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [icon, setIcon] = useState(zone?.icon || "mappin.circle.fill");
  const [title, setTitle] = useState(zone?.title || "");
  const [description, setDescription] = useState(zone?.description || "");
  const [mapLocation, setMapLocation] = useState(
    zone ? `${zone.address}, ${zone.location}` : ""
  );
  const [notificationOption, setNotificationOption] =
    useState<NotificationOption>(zone?.notificationOption || "both");
  const [notificationText, setNotificationText] = useState(
    zone?.notificationText || "You have entered the zone"
  );

  useEffect(() => {
    if (zone) {
      setIcon(zone.icon);
      setTitle(zone.title);
      setDescription(zone.description || "");
      setMapLocation(`${zone.address}, ${zone.location}`);
      setNotificationOption(zone.notificationOption);
      setNotificationText(zone.notificationText);
    }
  }, [zone]);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isClosingRef = React.useRef(false);

  const handleClose = React.useCallback(() => {
    if (!isClosingRef.current) {
      isClosingRef.current = true;
      router.back();
    }
  }, []);

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          if (event.translationY > 0 && !isClosingRef.current) {
            translateY.value = event.translationY;
            opacity.value = Math.max(0, 1 - event.translationY / 400);
          }
        })
        .onEnd((event) => {
          if (isClosingRef.current) return;

          if (event.translationY > 150) {
            isClosingRef.current = true;
            translateY.value = withSpring(1000, {
              damping: 20,
              stiffness: 90,
            });
            opacity.value = withSpring(
              0,
              {
                damping: 20,
                stiffness: 90,
              },
              (finished) => {
                if (finished) {
                  runOnJS(handleClose)();
                }
              }
            );
          } else {
            translateY.value = withSpring(0, {
              damping: 20,
              stiffness: 90,
            });
            opacity.value = withSpring(1, {
              damping: 20,
              stiffness: 90,
            });
          }
        }),
    [handleClose, translateY, opacity]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const { showToast } = useToast();

  const handleSave = () => {
    if (zone) {
      updateZone(zone.id, {
        icon,
        title,
        description,
        notificationOption,
        notificationText,
      });
      showToast("Zone updated successfully!");
    }
    setIsEditMode(false);
  };

  const handleShare = async () => {
    if (zone) {
      await shareZone(zone);
    }
  };

  const handleDelete = () => {
    if (zone) {
      deleteZone(zone.id);
      showToast("Zone deleted successfully");
      router.back();
    }
  };

  if (!zone) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color={muteTextColor}
          />
          <Text style={[styles.errorText, { color: textColor }]}>
            Zone not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { borderColor }]}
            onPress={handleClose}
          >
            <Text style={[styles.backButtonText, { color: textColor }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.modalContent, { backgroundColor }, animatedStyle]}
          >
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View
                style={[styles.handle, { backgroundColor: muteTextColor }]}
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={textColor} />
              </TouchableOpacity>
              {!isEditMode && (
                <View style={styles.headerRight}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/zone-statistics?id=${zone.id}`)
                    }
                    style={styles.shareButton}
                  >
                    <IconSymbol
                      name="chart.bar.fill"
                      size={20}
                      color={textColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleShare}
                    style={styles.shareButton}
                  >
                    <IconSymbol
                      name="square.and.arrow.up"
                      size={20}
                      color={textColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsEditMode(true)}
                    style={styles.editButton}
                  >
                    <Text style={[styles.editButtonText, { color: textColor }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Map View */}
            <View style={styles.mapContainer}>
              <Image
                source={zone.image || require("@/assets/images/map2.png")}
                style={styles.mapImage}
                contentFit="cover"
              />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoid}
              keyboardVerticalOffset={insets.top}
            >
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + 40 },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Icon Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Icon
                  </Text>
                  {isEditMode ? (
                    <View style={styles.iconSelector}>
                      {["mappin.circle.fill", "location.fill", "map.fill"].map(
                        (iconName) => (
                          <TouchableOpacity
                            key={iconName}
                            onPress={() => setIcon(iconName)}
                            style={[
                              styles.iconOption,
                              icon === iconName && {
                                backgroundColor: borderColor + "30",
                              },
                            ]}
                          >
                            <IconSymbol
                              name={iconName as any}
                              size={24}
                              color={
                                icon === iconName ? textColor : muteTextColor
                              }
                            />
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  ) : (
                    <View style={styles.iconDisplay}>
                      <IconSymbol
                        name={icon as any}
                        size={40}
                        color={textColor}
                      />
                    </View>
                  )}
                </View>

                {/* Map Location */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Map Location
                  </Text>
                  {isEditMode ? (
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={mapLocation}
                      onChangeText={setMapLocation}
                      placeholder="Enter location"
                      placeholderTextColor={muteTextColor}
                    />
                  ) : (
                    <View style={styles.valueContainer}>
                      <IconSymbol
                        name="map.fill"
                        size={16}
                        color={muteTextColor}
                      />
                      <Text style={[styles.valueText, { color: textColor }]}>
                        {mapLocation}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Title
                  </Text>
                  {isEditMode ? (
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter title"
                      placeholderTextColor={muteTextColor}
                    />
                  ) : (
                    <Text style={[styles.valueText, { color: textColor }]}>
                      {title}
                    </Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Description
                  </Text>
                  {isEditMode ? (
                    <TextInput
                      style={[
                        styles.textArea,
                        { color: textColor, borderColor },
                      ]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Enter description"
                      placeholderTextColor={muteTextColor}
                      multiline
                      numberOfLines={4}
                    />
                  ) : (
                    <Text style={[styles.valueText, { color: textColor }]}>
                      {description}
                    </Text>
                  )}
                </View>

                {/* Notification Options */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Notification Trigger
                  </Text>
                  {isEditMode ? (
                    <View style={styles.optionsContainer}>
                      {(["enter", "exit", "both"] as NotificationOption[]).map(
                        (option) => (
                          <TouchableOpacity
                            key={option}
                            onPress={() => setNotificationOption(option)}
                            style={[
                              styles.optionButton,
                              notificationOption === option && {
                                backgroundColor: borderColor + "30",
                                borderColor,
                              },
                              { borderColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                {
                                  color:
                                    notificationOption === option
                                      ? textColor
                                      : muteTextColor,
                                },
                              ]}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  ) : (
                    <View style={styles.valueContainer}>
                      <Text style={[styles.valueText, { color: textColor }]}>
                        {notificationOption.charAt(0).toUpperCase() +
                          notificationOption.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Notification Text */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Notification Text
                  </Text>
                  {isEditMode ? (
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={notificationText}
                      onChangeText={setNotificationText}
                      placeholder="Enter notification text"
                      placeholderTextColor={muteTextColor}
                    />
                  ) : (
                    <Text style={[styles.valueText, { color: textColor }]}>
                      {notificationText}
                    </Text>
                  )}
                </View>

                {/* Save Button (in edit mode) */}
                {isEditMode && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={handleSave}
                      style={[
                        styles.saveButton,
                        { backgroundColor: textColor },
                      ]}
                    >
                      <Text style={[styles.saveButtonText, { color: "#000" }]}>
                        Save Changes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditMode(false);
                        // Reset to original values
                        if (zone) {
                          setIcon(zone.icon);
                          setTitle(zone.title);
                          setDescription(zone.description || "");
                          setMapLocation(`${zone.address}, ${zone.location}`);
                          setNotificationOption(zone.notificationOption);
                          setNotificationText(zone.notificationText);
                        }
                      }}
                      style={styles.cancelButton}
                    >
                      <Text
                        style={[styles.cancelButtonText, { color: textColor }]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteDialog(true)}
                      style={[styles.deleteButton, { borderColor: "#FF3B30" }]}
                    >
                      <IconSymbol name="trash.fill" size={18} color="#FF3B30" />
                      <Text
                        style={[styles.deleteButtonText, { color: "#FF3B30" }]}
                      >
                        Delete Zone
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
        <DeleteConfirmationDialog
          visible={showDeleteDialog}
          title="Delete Zone"
          message={`Are you sure you want to delete "${zone?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          destructive
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: "0%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  mapContainer: {
    width: "90%",
    height: 200,
    overflow: "hidden",
    marginBottom: 20,
    borderRadius: 12,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  handleBar: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: "100%",
  },
  closeButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shareButton: {
    padding: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  keyboardAvoid: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {},
  section: {
    marginBottom: 24,
    width: "100%",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconDisplay: {
    alignItems: "center",
    paddingVertical: 12,
  },
  iconSelector: {
    flexDirection: "row",
    gap: 12,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  valueText: {
    fontSize: 16,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
