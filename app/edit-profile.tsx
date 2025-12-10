import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ImagePickerModal } from "@/components/ui/image-picker";
import { useToast } from "@/components/ui/toast-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useUserStore } from "@/stores/useUserStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileModal() {
  const muteTextColor = useThemeColor({}, "muteText");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "muteText");
  const backgroundColor = useThemeColor({}, "background");
  const insets = useSafeAreaInsets();

  const { user, updateUser } = useUserStore();
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [phone, setPhone] = useState(user.phone || "");
  const [gender, setGender] = useState(user.gender || "");
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    setUsername(user.username);
    setName(user.name);
    setBio(user.bio);
    setPhone(user.phone || "");
    setGender(user.gender || "");
  }, [user]);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        opacity.value = 1 - event.translationY / 400;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withSpring(1000);
        opacity.value = withSpring(0, {}, () => {
          runOnJS(router.back)();
        });
      } else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const handleClose = () => {
    router.back();
  };

  const { showToast } = useToast();

  const handleSave = () => {
    updateUser({
      username,
      name,
      bio,
      phone,
      gender,
      profileImage:
        typeof profileImage === "string" ? { uri: profileImage } : profileImage,
    });
    showToast("Profile updated successfully!");
    router.back();
  };

  const handleImageSelected = (uri: string) => {
    setProfileImage({ uri });
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemedView style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.modalContent, { backgroundColor }, animatedStyle]}
          >
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View
                style={[styles.handle, { backgroundColor: muteTextColor }]}
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={textColor} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={[styles.saveButtonText, { color: textColor }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoid}
              keyboardVerticalOffset={insets.top}
            >
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + 40 },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Profile Picture Section */}
                <View style={styles.profilePictureSection}>
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={profileImage}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={[
                        styles.changePhotoButton,
                        { backgroundColor: backgroundColor, borderColor },
                      ]}
                      onPress={() => setShowImagePicker(true)}
                    >
                      <IconSymbol
                        name="camera.fill"
                        size={20}
                        color={textColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => setShowImagePicker(true)}>
                    <Text
                      style={[styles.changePhotoText, { color: textColor }]}
                    >
                      Change Profile Photo
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Username */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Username
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    placeholderTextColor={muteTextColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Name */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Name
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={muteTextColor}
                  />
                </View>

                {/* Bio */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Bio
                  </Text>
                  <TextInput
                    style={[styles.textArea, { color: textColor, borderColor }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={muteTextColor}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.charCount, { color: muteTextColor }]}>
                    {bio.length}/150
                  </Text>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Personal Information
                  </Text>
                  <Text
                    style={[
                      styles.sectionDescription,
                      { color: muteTextColor },
                    ]}
                  >
                    Provide your personal information, even if the account is
                    used for a business, a pet or something else. This
                    won&apos;t be part of your public profile.
                  </Text>
                </View>

                {/* Email */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: muteTextColor, borderColor },
                    ]}
                    value={user.email}
                    placeholder="Enter email"
                    placeholderTextColor={muteTextColor}
                    editable={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <Text style={[styles.helperText, { color: muteTextColor }]}>
                    You can&apos;t change your email
                  </Text>
                </View>

                {/* Phone */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Phone
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor={muteTextColor}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Gender */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: muteTextColor }]}>
                    Gender
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Select gender"
                    placeholderTextColor={muteTextColor}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
      </ThemedView>
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  handleBar: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: "100%",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  keyboardAvoid: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: "relative",
    overflow: "visible",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});
