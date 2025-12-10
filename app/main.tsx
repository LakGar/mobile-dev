import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

export default function MainScreen() {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const muteTextColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }]}>
        {/* Logo */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.logoContainer}
        >
          <View style={[styles.logoCircle, { backgroundColor: textColor + "08" }]}>
            <IconSymbol name="mappin.circle.fill" size={64} color={textColor} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.titleContainer}
        >
          <Text style={[styles.title, { color: textColor }]}>Zones</Text>
          <Text style={[styles.subtitle, { color: muteTextColor }]}>
            Track your locations{'\n'}Manage your zones
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: textColor }]}
            onPress={() => router.push("/register")}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: backgroundColor }]}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: textColor + "30" }]}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: textColor }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  title: {
    fontSize: 56,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 16,
    letterSpacing: -3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  },
  spacer: {
    flex: 1,
    minHeight: 60,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

