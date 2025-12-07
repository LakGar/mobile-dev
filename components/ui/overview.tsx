import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";

type TimePeriod = "This Week" | "Month" | "All Time";

const Overview = () => {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const color1 = useThemeColor({}, "color1");
  const color2 = useThemeColor({}, "color2");
  const color3 = useThemeColor({}, "color3");
  const color4 = useThemeColor({}, "color4");
  const borderColor = useThemeColor({}, "muteText");
  const backgroundColor = useThemeColor({}, "background");
  const colorScheme = useColorScheme();
  const cardBackgroundColor =
    colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.03)";

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("This Week");
  const [isOpen, setIsOpen] = useState(false);

  const periods: TimePeriod[] = ["This Week", "Month", "All Time"];

  const handleSelect = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsOpen(false);
  };

  const data = [
    {
      title: "Completed",
      value: 10,
      color: color1,
    },
    {
      title: "Scheduled",
      value: 10,
      color: color2,
    },
    {
      title: "Pending",
      value: 10,
      color: color3,
    },
    {
      title: "All Tasks",
      value: 10,
      color: color4,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Overview</ThemedText>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, { borderColor }]}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text style={[styles.dropdownButtonText, { color: textColor }]}>
              {selectedPeriod}
            </Text>
            <IconSymbol
              name="chevron.down"
              size={16}
              color={muteTextColor}
              style={{
                transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>

          {isOpen && (
            <View
              style={[styles.dropdownMenu, { backgroundColor, borderColor }]}
            >
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.dropdownItem,
                    selectedPeriod === period && {
                      backgroundColor: borderColor + "20",
                    },
                  ]}
                  onPress={() => handleSelect(period)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color:
                          selectedPeriod === period ? textColor : muteTextColor,
                        fontWeight: selectedPeriod === period ? "600" : "400",
                      },
                    ]}
                  >
                    {period}
                  </Text>
                  {selectedPeriod === period && (
                    <IconSymbol name="checkmark" size={16} color={textColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={styles.content}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: item.color, borderColor }]}
          >
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <View style={styles.cardValueContainer}>
              <ThemedText style={styles.cardValue}>{item.value}</ThemedText>
              <TouchableOpacity>
                <IconSymbol name="chevron.right" size={16} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Overview;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: 20,
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: "45%",
    maxWidth: "42%",
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  cardValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
