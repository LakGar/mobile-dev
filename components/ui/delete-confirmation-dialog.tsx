import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface DeleteConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function DeleteConfirmationDialog({
  visible,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = true,
}: DeleteConfirmationDialogProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const muteTextColor = useThemeColor({}, "muteText");

  const confirmButtonColor = destructive ? "#FF3B30" : textColor;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} style={styles.blurContainer}>
          <View
            style={[
              styles.dialogContainer,
              { backgroundColor, borderColor },
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: destructive
                    ? "#FF3B30" + "20"
                    : muteTextColor + "20",
                },
              ]}
            >
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={32}
                color={destructive ? "#FF3B30" : muteTextColor}
              />
            </View>

            {/* Title */}
            <ThemedText style={styles.title}>{title}</ThemedText>

            {/* Message */}
            <Text style={[styles.message, { color: muteTextColor }]}>
              {message}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor },
                ]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: textColor }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: confirmButtonColor },
                ]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: destructive ? "#fff" : backgroundColor },
                  ]}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  blurContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

