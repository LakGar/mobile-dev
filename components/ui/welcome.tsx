import { useThemeColor } from "@/hooks/use-theme-color";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemedText } from "../themed-text";
import { useUserStore } from "@/stores/useUserStore";

const Welcome = () => {
  const muteTextColor = useThemeColor({}, "muteText");
  const { user, fetchUser } = useUserStore();
  
  React.useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.welcomeText}>Welcome {user.name.split(" ")[0]}</ThemedText>
      <Text style={[styles.subText, { color: muteTextColor }]}>
        You have been on a{" "}
        <Text style={{ color: "orange" }}>{user.streak} day streak</Text>
        <AntDesign name="fire" size={24} color="orange" />
      </Text>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 16,
    color: "gray",
  },
});
