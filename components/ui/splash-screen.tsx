import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

// Don't prevent auto-hide, we'll handle it manually

interface CustomSplashScreenProps {
  children: React.ReactNode;
  isReady: boolean;
}

const LOADING_MESSAGES = ["Getting location...", "Generating zones..."];

export function CustomSplashScreen({
  children,
  isReady,
}: CustomSplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoFadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  const textFadeAnim = useRef(new Animated.Value(1)).current; // Start visible

  useEffect(() => {
    // Keep native splash visible until we're ready to show our custom splash
    SplashScreen.preventAutoHideAsync();
  }, []);

  // Blinking cursor animation
  useEffect(() => {
    const cursorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    cursorAnimation.start();
    return () => cursorAnimation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isReady && !isAnimating) {
      // Wait a bit to show completion, then animate out
      const timer = setTimeout(() => {
        setIsAnimating(true);
        // Animate splash screen out
        Animated.parallel([
          Animated.timing(logoFadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500); // Wait 1.5s after ready to show completion

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isAnimating]);

  useEffect(() => {
    // Hide native splash and show our custom splash
    SplashScreen.hideAsync();

    // Animate logo and text in with scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Type out the current message letter by letter
    const currentMessage = LOADING_MESSAGES[currentMessageIndex];
    if (!currentMessage) return;

    setDisplayedText("");
    setIsTyping(true);

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);

        // Wait a bit before moving to next message
        setTimeout(() => {
          if (currentMessageIndex < LOADING_MESSAGES.length - 1) {
            setCurrentMessageIndex((prev) => prev + 1);
          }
        }, 1000);
      }
    }, 50); // Typing speed - 50ms per letter

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex]);

  if (!isReady || isAnimating) {
    return (
      <View style={styles.container}>
        <View style={[styles.backgroundImage, { backgroundColor: "#000000" }]}>
          <Image
            source={require("@/assets/images/splash-bg.avif")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onError={() => console.log("Image load error")}
          />
        </View>
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.5)"]}
          style={styles.overlay}
        />
        <Animated.View
          style={[
            styles.content,
            {
              opacity: logoFadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: logoFadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            Zones
          </Animated.Text>
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: textFadeAnim,
              },
            ]}
          >
            <Text style={styles.loadingText}>
              {displayedText || "Getting location..."}
              {isTyping && (
                <Animated.Text
                  style={[
                    styles.cursor,
                    {
                      opacity: cursorAnim,
                    },
                  ]}
                >
                  |
                </Animated.Text>
              )}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 64,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#ffffff",
    letterSpacing: -2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  loadingContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    opacity: 0.9,
    letterSpacing: 0.5,
    minHeight: 20,
  },
  cursor: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    opacity: 1,
  },
});
