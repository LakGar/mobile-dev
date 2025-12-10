import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How do I create a zone?",
    answer: "Tap the '+' button on the Explore screen or go to Maps and tap 'Create Zone'. Select a location on the map, set a radius, and customize your zone settings.",
  },
  {
    id: "2",
    question: "How do notifications work?",
    answer: "You'll receive notifications when you enter or exit a zone. You can customize notification settings for each zone individually in the zone details.",
  },
  {
    id: "3",
    question: "Can I share zones with friends?",
    answer: "Yes! Tap the share button on any zone card to share it with friends. They'll be able to see the zone location and details.",
  },
  {
    id: "4",
    question: "How do I delete a zone?",
    answer: "Open the zone details, tap Edit, then tap Delete Zone. You'll be asked to confirm before the zone is permanently deleted.",
  },
  {
    id: "5",
    question: "Is my location data private?",
    answer: "Yes! All location data is stored locally on your device. We never share your location data with third parties without your explicit consent.",
  },
  {
    id: "6",
    question: "How do I change my theme?",
    answer: "Go to Settings > Appearance to choose between Light, Dark, or System theme. The app will automatically adapt to your preference.",
  },
];

export default function HelpCenterScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, borderBottomColor: borderColor },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Help Center</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={[styles.searchContainer, { borderColor }]}>
          <IconSymbol name="magnifyingglass" size={18} color={muteTextColor} />
          <TextInput
            placeholder="Search help articles..."
            placeholderTextColor={muteTextColor}
            style={[styles.searchInput, { color: textColor }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Frequently Asked Questions
          </Text>
          {filteredFAQs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="questionmark.circle.fill"
                size={48}
                color={muteTextColor}
              />
              <Text style={[styles.emptyText, { color: muteTextColor }]}>
                No results found
              </Text>
            </View>
          ) : (
            filteredFAQs.map((faq) => {
              const isExpanded = expandedItems.has(faq.id);
              return (
                <View
                  key={faq.id}
                  style={[styles.faqItem, { backgroundColor, borderColor }]}
                >
                  <TouchableOpacity
                    onPress={() => toggleFAQ(faq.id)}
                    style={styles.faqHeader}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.faqQuestion, { color: textColor }]}>
                      {faq.question}
                    </Text>
                    <IconSymbol
                      name="chevron.down"
                      size={20}
                      color={muteTextColor}
                      style={[
                        styles.chevron,
                        isExpanded && styles.chevronExpanded,
                      ]}
                    />
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.faqAnswer}>
                      <Text style={[styles.faqAnswerText, { color: muteTextColor }]}>
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Contact Support */}
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor, borderColor }]}
          onPress={() => router.push("/contact-us")}
          activeOpacity={0.7}
        >
          <View style={styles.contactButtonLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: muteTextColor + "20" },
              ]}
            >
              <IconSymbol name="envelope.fill" size={20} color={textColor} />
            </View>
            <View>
              <Text style={[styles.contactButtonTitle, { color: textColor }]}>
                Still need help?
              </Text>
              <Text style={[styles.contactButtonSubtitle, { color: muteTextColor }]}>
                Contact our support team
              </Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color={muteTextColor} />
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  faqSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactButtonSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

