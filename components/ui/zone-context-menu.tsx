import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { IconSymbol } from "./icon-symbol";

interface ZoneContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onViewStats?: () => void;
  position: { x: number; y: number };
}

export function ZoneContextMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
  onShare,
  onViewStats,
  position,
}: ZoneContextMenuProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muteTextColor = useThemeColor({}, "muteText");
  const borderColor = useThemeColor({}, "muteText");

  const menuItems = [
    onViewStats && {
      icon: "chart.bar.fill",
      label: "View Statistics",
      onPress: () => {
        onViewStats?.();
        onClose();
      },
      color: textColor,
    },
    onShare && {
      icon: "square.and.arrow.up",
      label: "Share",
      onPress: () => {
        onShare?.();
        onClose();
      },
      color: textColor,
    },
    {
      icon: "pencil",
      label: "Edit",
      onPress: () => {
        onEdit();
        onClose();
      },
      color: textColor,
    },
    {
      icon: "trash.fill",
      label: "Delete",
      onPress: () => {
        onDelete();
        onClose();
      },
      color: "#FF3B30",
    },
  ].filter(Boolean) as Array<{
    icon: string;
    label: string;
    onPress: () => void;
    color: string;
  }>;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menu,
              {
                backgroundColor,
                borderColor,
                top: position.y,
                left: position.x,
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && {
                    borderBottomColor: borderColor,
                  },
                ]}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: muteTextColor + "20" },
                  ]}
                >
                  <IconSymbol name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menu: {
    position: "absolute",
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});

