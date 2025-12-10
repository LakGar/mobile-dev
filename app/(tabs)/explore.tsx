import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/ui/toast-provider";
import { ZoneContextMenu } from "@/components/ui/zone-context-menu";
import { ZoneSwipeActions } from "@/components/ui/zone-swipe-actions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useZoneStore } from "@/stores/useZoneStore";
import { shareZone } from "@/utils/share";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface ZoneCardWithSwipeProps {
  zone: {
    id: number;
    color: string;
    icon: string;
    image?: any;
    address: string;
    location: string;
    title: string;
  };
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onLongPress: (event: any) => void;
  textColor: string;
  backgroundColor: string;
  muteTextColor: string;
}

const ZoneCardWithSwipe = ({
  zone,
  onPress,
  onEdit,
  onDelete,
  onShare,
  onLongPress,
  textColor,
  backgroundColor,
  muteTextColor,
}: ZoneCardWithSwipeProps) => {
  const swipeableRef = useRef<Swipeable>(null);
  const translateX = useRef({ value: 0 }).current;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <ZoneSwipeActions
          translateX={translateX as any}
          onEdit={() => {
            swipeableRef.current?.close();
            onEdit();
          }}
          onDelete={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          onShare={() => {
            swipeableRef.current?.close();
            onShare();
          }}
        />
      )}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[
          styles.zoneCard,
          {
            backgroundColor: zone.color,
            borderColor: zone.color,
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.zoneMapContainer}>
          <Image
            source={zone.image || require("@/assets/images/map.png")}
            style={styles.zoneMapImage}
            contentFit="cover"
          />
          <BlurView intensity={80} style={styles.blurOverlay}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <IconSymbol
                  name={zone.icon as any}
                  size={24}
                  color={textColor}
                />
                <Text
                  style={[styles.cardTitle, { color: textColor }]}
                  numberOfLines={1}
                >
                  {zone.title}
                </Text>
              </View>
              <Text
                style={[styles.cardAddress, { color: textColor }]}
                numberOfLines={1}
              >
                {zone.address}
              </Text>
              <View style={styles.cardLocation}>
                <IconSymbol
                  name="paperplane.fill"
                  size={12}
                  color={muteTextColor}
                />
                <Text
                  style={[styles.cardLocationText, { color: muteTextColor }]}
                  numberOfLines={1}
                >
                  {zone.location}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default function ExploreScreen() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "muteText");
  const insets = useSafeAreaInsets();

  const { zones } = useZoneStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date" | "radius">("name");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    zoneId: number;
    position: { x: number; y: number };
  }>({ visible: false, zoneId: 0, position: { x: 0, y: 0 } });
  const { deleteZone } = useZoneStore();
  const { showToast } = useToast();

  const filteredZones = useMemo(() => {
    let result = zones.filter(
      (zone) =>
        zone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by icon
    if (selectedIcon) {
      result = result.filter((zone) => zone.icon === selectedIcon);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "radius":
          return b.radius - a.radius;
        default:
          return 0;
      }
    });

    return result;
  }, [zones, searchQuery, selectedIcon, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleZonePress = (zoneId: number) => {
    router.push(`/zone-detail?id=${zoneId}`);
  };

  const handleCreateZone = () => {
    router.push("/create-zone");
  };

  const handleDeleteZone = (zoneId: number) => {
    setZoneToDelete(zoneId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (zoneToDelete) {
      deleteZone(zoneToDelete);
      showToast("Zone deleted successfully");
      setShowDeleteDialog(false);
      setZoneToDelete(null);
    }
  };

  const handleEditZone = (zoneId: number) => {
    router.push(`/zone-detail?id=${zoneId}`);
  };

  const handleShareZone = async (zoneId: number) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) {
      await shareZone(zone);
    }
  };

  const handleLongPress = (zoneId: number, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setContextMenu({
      visible: true,
      zoneId,
      position: { x: pageX, y: pageY },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Explore Zones</ThemedText>
          <TouchableOpacity
            style={[styles.createButton, { borderColor }]}
            onPress={handleCreateZone}
          >
            <IconSymbol name="plus" size={20} color={textColor} />
            <Text style={[styles.createButtonText, { color: textColor }]}>
              Create
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <BlurView intensity={80} style={styles.searchInputBlur}>
            <View
              style={[
                styles.searchInputContainer,
                {
                  borderColor,
                },
              ]}
            >
              <IconSymbol
                name="magnifyingglass"
                size={18}
                color={muteTextColor}
              />
              <TextInput
                placeholder="Search zones..."
                placeholderTextColor={muteTextColor}
                style={[styles.searchInput, { color: textColor }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <IconSymbol name="xmark" size={18} color={muteTextColor} />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>

        {/* Filters & Sort Bar */}
        <View style={styles.filtersBar}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: showFilters ? textColor : backgroundColor,
                borderColor,
              },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={18}
              color={showFilters ? backgroundColor : textColor}
            />
            <Text
              style={[
                styles.filterButtonText,
                { color: showFilters ? backgroundColor : textColor },
              ]}
            >
              Filters
            </Text>
            {(selectedIcon || sortBy !== "name") && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, { color: muteTextColor }]}>
              Sort:
            </Text>
            <TouchableOpacity
              style={[
                styles.sortButton,
                {
                  backgroundColor: backgroundColor,
                  borderColor,
                },
              ]}
              onPress={() => {
                const options: ("name" | "date" | "radius")[] = [
                  "name",
                  "date",
                  "radius",
                ];
                const currentIndex = options.indexOf(sortBy);
                setSortBy(options[(currentIndex + 1) % options.length]);
              }}
            >
              <Text style={[styles.sortButtonText, { color: textColor }]}>
                {sortBy === "name"
                  ? "Name"
                  : sortBy === "date"
                  ? "Date"
                  : "Radius"}
              </Text>
              <IconSymbol name="chevron.down" size={14} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Count */}
        {(searchQuery.length > 0 || selectedIcon || sortBy !== "name") && (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsText, { color: muteTextColor }]}>
              {filteredZones.length} zone{filteredZones.length !== 1 ? "s" : ""}{" "}
              found
            </Text>
            {(selectedIcon || sortBy !== "name") && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedIcon(null);
                  setSortBy("name");
                }}
              >
                <Text style={[styles.clearFiltersText, { color: textColor }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Zones Grid */}
        {filteredZones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="mappin.slash" size={64} color={muteTextColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              {searchQuery.length > 0 ? "No zones found" : "No zones yet"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: muteTextColor }]}>
              {searchQuery.length > 0
                ? "Try a different search term"
                : "Create your first zone to get started"}
            </Text>
            {searchQuery.length === 0 && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: textColor }]}
                onPress={handleCreateZone}
              >
                <Text
                  style={[styles.emptyButtonText, { color: backgroundColor }]}
                >
                  Create Zone
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.zonesGrid}>
            {filteredZones.map((zone) => (
              <ZoneCardWithSwipe
                key={zone.id}
                zone={zone}
                onPress={() => handleZonePress(zone.id)}
                onEdit={() => handleEditZone(zone.id)}
                onDelete={() => handleDeleteZone(zone.id)}
                onShare={() => handleShareZone(zone.id)}
                onLongPress={(e) => handleLongPress(zone.id, e)}
                textColor={textColor}
                backgroundColor={backgroundColor}
                muteTextColor={muteTextColor}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <View
            style={[styles.filtersModal, { backgroundColor, borderColor }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Filters</ThemedText>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <IconSymbol name="xmark" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Icon Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: textColor }]}>
                  Zone Type
                </Text>
                <View style={styles.iconFilterGrid}>
                  {[
                    { icon: "house.fill", label: "Home" },
                    { icon: "location.fill", label: "Location" },
                    { icon: "map.fill", label: "Map" },
                    { icon: "mappin.circle.fill", label: "Pin" },
                  ].map(({ icon, label }) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconFilterOption,
                        {
                          backgroundColor:
                            selectedIcon === icon ? textColor : backgroundColor,
                          borderColor,
                        },
                      ]}
                      onPress={() =>
                        setSelectedIcon(selectedIcon === icon ? null : icon)
                      }
                    >
                      <IconSymbol
                        name={icon as any}
                        size={24}
                        color={
                          selectedIcon === icon ? backgroundColor : textColor
                        }
                      />
                      <Text
                        style={[
                          styles.iconFilterLabel,
                          {
                            color:
                              selectedIcon === icon
                                ? backgroundColor
                                : textColor,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <DeleteConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Zone"
        message={`Are you sure you want to delete this zone? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setZoneToDelete(null);
        }}
        destructive
      />

      <ZoneContextMenu
        visible={contextMenu.visible}
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        position={contextMenu.position}
        onEdit={() => handleEditZone(contextMenu.zoneId)}
        onDelete={() => handleDeleteZone(contextMenu.zoneId)}
        onShare={() => handleShareZone(contextMenu.zoneId)}
        onViewStats={() =>
          router.push(`/zone-statistics?id=${contextMenu.zoneId}`)
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputBlur: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  resultsText: {
    fontSize: 14,
  },
  zonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
  zoneCard: {
    width: (width - 56) / 2,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  zoneMapContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  zoneMapImage: {
    width: "100%",
    height: "100%",
  },
  blurOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  cardAddress: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  cardLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardLocationText: {
    fontSize: 10,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filtersBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginLeft: 4,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filtersModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  iconFilterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconFilterOption: {
    width: (width - 80) / 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  iconFilterLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});
