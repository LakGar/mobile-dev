// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "person.fill": "person",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "keyboard-arrow-down",
  checkmark: "check",
  "location.fill": "location-on",
  "mappin.circle.fill": "place",
  "map.fill": "map",
  "square.and.arrow.up": "share",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "gearshape.fill": "settings",
  "camera.fill": "camera-alt",
  xmark: "close",
  "lock.fill": "lock",
  "envelope.fill": "email",
  "bell.fill": "notifications",
  "speaker.wave.2.fill": "volume-up",
  "hand.tap.fill": "touch-app",
  "lock.shield.fill": "security",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility_off",
  "key.fill": "vpn-key",
  "moon.fill": "dark-mode",
  globe: "language",
  "square.and.arrow.down.fill": "download",
  "questionmark.circle.fill": "help-outline",
  "doc.text.fill": "description",
  "hand.raised.fill": "privacy-tip",
  "info.circle.fill": "info",
  "star.fill": "star",
  "trash.fill": "delete",
  "arrow.clockwise": "refresh",
  "figure.run": "fitness-center",
  "cup.and.saucer.fill": "local-cafe",
  "tree.fill": "park",
  "sun.max.fill": "wb-sunny",
  "exclamationmark.triangle.fill": "warning",
  "exclamationmark.triangle": "warning",
  "magnifyingglass": "search",
  "plus": "add",
  "mappin.slash": "location-off",
  "clock": "access-time",
  "fork.knife": "restaurant",
  "bag.fill": "shopping-bag",
  "fuelpump.fill": "local-gas-station",
  "bed.double.fill": "hotel",
  "cross.case.fill": "medical-services",
  "book.fill": "menu-book",
  "folder.fill": "folder",
  "chart.bar.fill": "bar-chart",
  "phone.fill": "phone",
  calendar: "calendar-today",
  "line.3.horizontal.decrease": "tune",
  pencil: "edit",
  "photo.fill": "photo-library",
  "rectangle.portrait.and.arrow.right": "logout",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
