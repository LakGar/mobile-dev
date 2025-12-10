import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { IconSymbol } from "./icon-symbol";
import * as Linking from "expo-linking";

interface RateAppDialogProps {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
}

export function RateAppDialog({
  visible,
  onClose,
  onDismiss,
}: RateAppDialogProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");

  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const handleRate = () => {
    setHasRated(true);
    // In a real app, you would open the app store
    // Linking.openURL("https://apps.apple.com/app/idYOUR_APP_ID");
    // or Linking.openURL("https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME");
    setTimeout(() => {
      onClose();
      setRating(0);
      setHasRated(false);
    }, 1500);
  };

  const handleDismiss = () => {
    onDismiss?.();
    onClose();
    setRating(0);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialog,
                { backgroundColor, borderColor },
              ]}
            >
              <IconSymbol name="star.fill" size={48} color="#FFD700" />
              <Text style={[styles.title, { color: textColor }]}>
                Enjoying Zone?
              </Text>
              <Text style={[styles.message, { color: muteTextColor }]}>
                {hasRated
                  ? "Thank you for your feedback!"
                  : "Your feedback helps us improve. Would you mind rating us?"}
              </Text>

              {!hasRated && (
                <>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                      >
                        <IconSymbol
                          name="star.fill"
                          size={32}
                          color={star <= rating ? "#FFD700" : muteTextColor}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {rating >= 4 && (
                    <TouchableOpacity
                      style={[
                        styles.rateButton,
                        { backgroundColor: textColor },
                      ]}
                      onPress={handleRate}
                    >
                      <Text
                        style={[
                          styles.rateButtonText,
                          { color: backgroundColor },
                        ]}
                      >
                        Rate on App Store
                      </Text>
                    </TouchableOpacity>
                  )}

                  {rating > 0 && rating < 4 && (
                    <TouchableOpacity
                      style={[
                        styles.feedbackButton,
                        { borderColor },
                      ]}
                      onPress={handleDismiss}
                    >
                      <Text style={[styles.feedbackButtonText, { color: textColor }]}>
                        Send Feedback
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
              >
                <Text style={[styles.dismissButtonText, { color: muteTextColor }]}>
                  {hasRated ? "Close" : "Maybe Later"}
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  rateButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissButtonText: {
    fontSize: 14,
  },
});

