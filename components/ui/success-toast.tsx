import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { IconSymbol } from "./icon-symbol";

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function SuccessToast({
  message,
  visible,
  onHide,
  duration = 3000,
}: SuccessToastProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onHide)();
        });
      }, duration);
      return () => clearTimeout(timer);
    } else {
      translateY.value = -100;
      opacity.value = 0;
    }
  }, [visible, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, borderColor: textColor + "20" },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: "#4CAF50" + "20" }]}>
        <IconSymbol name="checkmark" size={20} color="#4CAF50" />
      </View>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    zIndex: 9999,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});

