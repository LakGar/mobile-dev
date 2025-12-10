import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  FadeIn,
  FadeOut,
  interpolate,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: string;
  title: string;
  description: string;
  gradientColors: string[];
}

const slides: OnboardingSlide[] = [
  {
    icon: "mappin.circle.fill",
    title: "Welcome to Zone",
    description:
      "Create and manage location-based zones to track your movements and get notified when you enter or exit areas.",
    gradientColors: ["#000000", "#000000"], // Black background
  },
  {
    icon: "bell.fill",
    title: "Smart Notifications",
    description:
      "Get instant notifications when you enter or exit your zones. Customize alerts for each zone.",
    gradientColors: ["#000000", "#000000"], // Black background
  },
  {
    icon: "map.fill",
    title: "Track Your Activity",
    description:
      "See your zone activity history, track visits, and analyze your movement patterns over time.",
    gradientColors: ["#000000", "#000000"], // Black background
  },
  {
    icon: "lock.shield.fill",
    title: "Privacy First",
    description:
      "Your location data stays on your device. We respect your privacy and give you full control.",
    gradientColors: ["#000000", "#000000"], // Black background
  },
];

// Subtle accent colors for icons/buttons
const accentColors = ["#667eea", "#f5576c", "#4facfe", "#43e97b"];

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const LoadingDots = () => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animateDot1 = () => {
      dot1.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      );
    };
    const animateDot2 = () => {
      dot2.value = withDelay(
        150,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        )
      );
    };
    const animateDot3 = () => {
      dot3.value = withDelay(
        300,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        )
      );
    };

    animateDot1();
    animateDot2();
    animateDot3();
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: 0.5 + dot1.value * 0.5 }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: 0.5 + dot2.value * 0.5 }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: 0.5 + dot3.value * 0.5 }],
  }));

  return (
    <View style={styles.loadingDot}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [requestingPermissions, setRequestingPermissions] = useState(false);

  const slidePosition = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const skipOpacity = useSharedValue(1);

  useEffect(() => {
    // Animate icon on slide change
    iconScale.value = withSequence(
      withSpring(1.15, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
    iconRotation.value = withSpring(currentSlide * 12, {
      damping: 15,
      stiffness: 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  const slideAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: -slidePosition.value * width,
        },
      ],
    };
  });

  // Create animated styles for each slide content
  const slideContentStyle0 = useAnimatedStyle(() => {
    const offset = slidePosition.value - 0;
    const opacity = interpolate(
      offset,
      [-1, 0, 1],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      offset,
      [-1, 0, 1],
      [30, 0, -30],
      Extrapolate.CLAMP
    );
    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withSpring(translateY, { damping: 20 }) }],
    };
  });

  const slideContentStyle1 = useAnimatedStyle(() => {
    const offset = slidePosition.value - 1;
    const opacity = interpolate(
      offset,
      [-1, 0, 1],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      offset,
      [-1, 0, 1],
      [30, 0, -30],
      Extrapolate.CLAMP
    );
    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withSpring(translateY, { damping: 20 }) }],
    };
  });

  const slideContentStyle2 = useAnimatedStyle(() => {
    const offset = slidePosition.value - 2;
    const opacity = interpolate(
      offset,
      [-1, 0, 1],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      offset,
      [-1, 0, 1],
      [30, 0, -30],
      Extrapolate.CLAMP
    );
    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withSpring(translateY, { damping: 20 }) }],
    };
  });

  const slideContentStyle3 = useAnimatedStyle(() => {
    const offset = slidePosition.value - 3;
    const opacity = interpolate(
      offset,
      [-1, 0, 1],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      offset,
      [-1, 0, 1],
      [30, 0, -30],
      Extrapolate.CLAMP
    );
    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withSpring(translateY, { damping: 20 }) }],
    };
  });

  const slideContentStyles = [
    slideContentStyle0,
    slideContentStyle1,
    slideContentStyle2,
    slideContentStyle3,
  ];

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { rotate: `${iconRotation.value}deg` },
      ],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const skipAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: skipOpacity.value,
    };
  });

  // Create animated styles for indicators
  const indicatorStyle0 = useAnimatedStyle(() => {
    const width = interpolate(
      slidePosition.value,
      [-1, 0, 1],
      [8, 32, 8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      slidePosition.value,
      [-1, 0, 1],
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );
    return {
      width: withSpring(width, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const indicatorStyle1 = useAnimatedStyle(() => {
    const width = interpolate(
      slidePosition.value,
      [0, 1, 2],
      [8, 32, 8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      slidePosition.value,
      [0, 1, 2],
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );
    return {
      width: withSpring(width, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const indicatorStyle2 = useAnimatedStyle(() => {
    const width = interpolate(
      slidePosition.value,
      [1, 2, 3],
      [8, 32, 8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      slidePosition.value,
      [1, 2, 3],
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );
    return {
      width: withSpring(width, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const indicatorStyle3 = useAnimatedStyle(() => {
    const width = interpolate(
      slidePosition.value,
      [2, 3, 4],
      [8, 32, 8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      slidePosition.value,
      [2, 3, 4],
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );
    return {
      width: withSpring(width, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const indicatorStyles = [
    indicatorStyle0,
    indicatorStyle1,
    indicatorStyle2,
    indicatorStyle3,
  ];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      slidePosition.value = withSpring(nextSlide, {
        damping: 20,
        stiffness: 90,
      });
      buttonScale.value = withSequence(
        withSpring(0.95, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    skipOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => handleFinish(), 200);
  };

  const { setOnboardingComplete } = useOnboardingStore();

  const handleFinish = async () => {
    setRequestingPermissions(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          await Location.requestBackgroundPermissionsAsync();
        } catch {
          // Background permission not critical
        }
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    } finally {
      setRequestingPermissions(false);
      await setOnboardingComplete(true);
      router.replace("/(tabs)");
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      slidePosition.value = withSpring(prevSlide, {
        damping: 20,
        stiffness: 90,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Black Background */}
      <View style={styles.blackBackground} />

      {/* Skip Button */}
      <Animated.View
        style={[
          styles.skipContainer,
          { paddingTop: insets.top + 20 },
          skipAnimatedStyle,
        ]}
      >
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Slides */}
      <View style={styles.slidesContainer}>
        <Animated.View style={[styles.slidesWrapper, slideAnimatedStyle]}>
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <Animated.View
                entering={FadeIn.delay(index * 50).duration(200)}
                style={[styles.slideContent, slideContentStyles[index]]}
              >
                {/* Icon with subtle color accent */}
                <Animated.View
                  entering={FadeIn.delay(50).duration(200)}
                  style={styles.iconWrapper}
                >
                  <Animated.View style={iconAnimatedStyle}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: "transparent",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        },
                      ]}
                    >
                      <IconSymbol
                        name={slide.icon as any}
                        size={72}
                        color={accentColors[index]}
                      />
                    </View>
                  </Animated.View>
                </Animated.View>

                {/* Title */}
                <Animated.View
                  entering={SlideInRight.delay(100 + index * 50).duration(200)}
                  style={styles.titleContainer}
                >
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                </Animated.View>

                {/* Description */}
                <Animated.View
                  entering={SlideInRight.delay(150 + index * 50).duration(200)}
                  style={styles.descriptionContainer}
                >
                  <Text style={styles.slideDescription}>
                    {slide.description}
                  </Text>
                </Animated.View>
              </Animated.View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Indicators */}
      <View style={styles.indicators}>
        {slides.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentSlide
                    ? accentColors[index]
                    : "rgba(255, 255, 255, 0.2)",
              },
              indicatorStyles[index],
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={[styles.navigation, { paddingBottom: insets.bottom + 20 }]}>
        {currentSlide > 0 && (
          <AnimatedTouchableOpacity
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            onPress={handlePrevious}
            style={[styles.navButton, styles.prevButton]}
            activeOpacity={0.8}
          >
            <IconSymbol
              name="chevron.left"
              size={20}
              color="rgba(255, 255, 255, 0.7)"
            />
            <Text style={styles.prevButtonText}>Previous</Text>
          </AnimatedTouchableOpacity>
        )}
        <AnimatedTouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            buttonAnimatedStyle,
            { borderColor: accentColors[currentSlide] + "40" },
          ]}
          onPress={handleNext}
          disabled={requestingPermissions}
          activeOpacity={0.9}
        >
          <View style={styles.nextButtonContent}>
            <Text style={styles.nextButtonText}>
              {requestingPermissions
                ? "Setting up..."
                : currentSlide === slides.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            {currentSlide < slides.length - 1 && !requestingPermissions && (
              <IconSymbol
                name="chevron.right"
                size={20}
                color={accentColors[currentSlide]}
              />
            )}
            {requestingPermissions && <LoadingDots />}
          </View>
        </AnimatedTouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  blackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  skipContainer: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
    zIndex: 10,
  },
  skipButton: {
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  slidesContainer: {
    flex: 1,
    overflow: "hidden",
  },
  slidesWrapper: {
    flexDirection: "row",
    width: width * slides.length,
    height: "100%",
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
    position: "relative",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  slideDescription: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
  descriptionContainer: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
    overflow: "hidden",
  },
  prevButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  nextButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
  },
  nextButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  loadingDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
});
