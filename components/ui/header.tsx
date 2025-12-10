import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useZoneStore } from "@/stores/useZoneStore";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { IconSymbol } from "./icon-symbol";

const LoaderAnimation = ({ color }: { color: string }) => {
  const opacity1 = useSharedValue(0.3);
  const opacity2 = useSharedValue(0.3);
  const opacity3 = useSharedValue(0.3);

  React.useEffect(() => {
    opacity1.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    setTimeout(() => {
      opacity2.value = withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, 200);
    setTimeout(() => {
      opacity3.value = withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, 400);
  }, [opacity1, opacity2, opacity3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: opacity3.value,
  }));

  return (
    <View style={styles.loaderWrapper}>
      <Animated.View
        style={[styles.loaderDot, { backgroundColor: color }, animatedStyle1]}
      />
      <Animated.View
        style={[styles.loaderDot, { backgroundColor: color }, animatedStyle2]}
      />
      <Animated.View
        style={[styles.loaderDot, { backgroundColor: color }, animatedStyle3]}
      />
    </View>
  );
};

const Header = () => {
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const colorScheme = useColorScheme();
  const { zones } = useZoneStore();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Gradient colors: transparent at top, borderColor with opacity at bottom
  const gradientStart =
    colorScheme === "dark" ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)";
  const gradientEnd =
    colorScheme === "dark"
      ? "rgba(42, 42, 42, 0.8)" // muteText dark mode with opacity
      : "rgba(199, 199, 204, 0.8)"; // muteText light mode with opacity

  // Filter zones based on search query
  const results = showResults
    ? zones
        .filter(
          (zone) =>
            zone.title.toLowerCase().includes(search.toLowerCase()) ||
            zone.address.toLowerCase().includes(search.toLowerCase()) ||
            zone.location.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
        .map((zone) => ({
          id: zone.id,
          title: zone.title,
          description: `${zone.address}, ${zone.location}`,
          icon: zone.icon,
          color: zone.color,
        }))
    : [];

  useEffect(() => {
    if (search.length > 0) {
      setIsLoading(true);
      setShowResults(false);

      // Simulate search delay
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      setShowResults(false);
    }
  }, [search]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.searchContainer, { borderColor }]}>
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <IconSymbol name="xmark" size={20} color={muteTextColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setSearch("")}>
              <IconSymbol
                name="magnifyingglass"
                size={20}
                color={muteTextColor}
              />
            </TouchableOpacity>
          )}
          <TextInput
            placeholder="Search zones"
            style={[styles.searchInput, { color: textColor }]}
            placeholderTextColor={muteTextColor}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.userImage}
        />
      </View>

      {search.length > 0 && (
        <View style={[styles.searchResultsContainer, { borderColor }]}>
          {isLoading ? (
            <View style={[styles.loaderContainer, { backgroundColor }]}>
              <LoaderAnimation color={textColor} />
            </View>
          ) : showResults && results.length > 0 ? (
            <View
              style={[
                styles.resultsList,
                {
                  backgroundColor: backgroundColor,
                  borderRadius: 10,
                },
              ]}
            >
              {results.map((result, index) => (
                <View key={result.id}>
                  <TouchableOpacity
                    style={[styles.searchResultItem, {}]}
                    onPress={() => router.push(`/zone-detail?id=${result.id}`)}
                  >
                    <View
                      style={[
                        styles.resultIconContainer,
                        { backgroundColor: result.color },
                      ]}
                    >
                      <IconSymbol
                        name={result.icon as any}
                        size={24}
                        color="#000000"
                      />
                    </View>
                    <View style={styles.resultTextContainer}>
                      <Text style={[styles.resultTitle, { color: textColor }]}>
                        {result.title}
                      </Text>
                      <Text
                        style={[
                          styles.resultDescription,
                          { color: muteTextColor },
                        ]}
                      >
                        {result.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() =>
                        router.push(`/zone-detail?id=${result.id}`)
                      }
                    >
                      <IconSymbol
                        name="arrow.right"
                        size={20}
                        color={textColor}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {index < results.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: muteTextColor },
                      ]}
                    />
                  )}
                </View>
              ))}
              <LinearGradient
                colors={[gradientStart, gradientEnd]}
                style={styles.overlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 30,
  },
  searchResultsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  resultsList: {
    paddingVertical: 8,
  },
  loaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    zIndex: 1,
    position: "relative",
  },
  divider: {
    height: 1,
    marginLeft: 20,
    opacity: 0.2,
  },
  resultIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTextContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultDescription: {
    fontSize: 14,
  },
  navigateButton: {
    padding: 8,
  },
  overlay: {
    width: "100%",
    height: 40,
    position: "absolute",
    bottom: 0,
    left: 0,
    opacity: 0.3,
    zIndex: 0,
  },
});
