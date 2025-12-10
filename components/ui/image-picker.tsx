import { useThemeColor } from "@/hooks/use-theme-color";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { IconSymbol } from "./icon-symbol";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
}

export function ImagePickerModal({
  visible,
  onClose,
  onImageSelected,
}: ImagePickerModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to select an image."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modal,
                { backgroundColor, borderColor },
              ]}
            >
              <Text style={[styles.title, { color: textColor }]}>
                Select Profile Picture
              </Text>

              <TouchableOpacity
                style={[styles.option, { borderColor }]}
                onPress={takePhoto}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="camera.fill" size={24} color={textColor} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    Take Photo
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: muteTextColor }]}>
                    Use camera to take a new photo
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={muteTextColor} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { borderColor }]}
                onPress={pickImage}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name="photo.fill" size={24} color={textColor} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    Choose from Library
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: muteTextColor }]}>
                    Select an existing photo
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={muteTextColor} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: textColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 13,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

