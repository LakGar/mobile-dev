import { Alert, Platform, Share } from "react-native";
import { Zone } from "@/types";

export const shareZone = async (zone: Zone) => {
  try {
    const shareText = `Check out my ${zone.title} zone!\n\n${zone.address}\n${zone.location}\n\nCreated with Zone App`;

    if (Platform.OS === "web") {
      // Web sharing
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: zone.title,
          text: shareText,
        });
      } else {
        // Fallback: copy to clipboard
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          Alert.alert("Copied!", "Zone details copied to clipboard");
        } else {
          Alert.alert("Share", shareText);
        }
      }
    } else {
      // Native sharing using React Native Share API
      const result = await Share.share({
        message: shareText,
        title: zone.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
        } else {
          // Shared
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    }
  } catch (error: any) {
    console.error("Error sharing zone:", error);
    if (error.message !== "User did not share") {
      Alert.alert("Error", "Failed to share zone");
    }
  }
};

