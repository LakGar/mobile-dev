import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { IconSymbol } from "./icon-symbol";

interface ZoneSwipeActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  translateX: Animated.SharedValue<number>;
}

export function ZoneSwipeActions({
  onEdit,
  onDelete,
  onShare,
  translateX,
}: ZoneSwipeActionsProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const actionStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, actionStyle]}>
      {onShare && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#007AFF" }]}
          onPress={onShare}
        >
          <IconSymbol name="square.and.arrow.up" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#FF9500" }]}
        onPress={onEdit}
      >
        <IconSymbol name="pencil" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
        onPress={onDelete}
      >
        <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 16,
    gap: 8,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});

