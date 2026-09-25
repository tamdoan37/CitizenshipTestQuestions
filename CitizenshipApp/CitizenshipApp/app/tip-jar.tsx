import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenBackground } from "@/components/ScreenBackground";

const ANDROID_PACKAGE = "com.yourname.citizenshiptest";
// Set once the App Store listing is live to deep-link straight to the review.
const IOS_APP_ID = "";

async function openStoreListing(): Promise<void> {
  let url = "";
  if (Platform.OS === "android") {
    url = `market://details?id=${ANDROID_PACKAGE}`;
  } else if (Platform.OS === "ios" && IOS_APP_ID) {
    url = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
  }
  try {
    if (!url) throw new Error("no-listing");
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error("unsupported");
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Thank you! 💙",
      "The app store listing isn't live yet. Once the app is published, this will take you straight there to leave your rating and review."
    );
  }
}

async function shareApp(): Promise<void> {
  try {
    await Share.share({
      message:
        "I'm studying for the U.S. citizenship test with this free app — all 128 civics questions, flashcards, quizzes, and audio practice. Check it out!",
    });
  } catch {
    /* user dismissed the share sheet */
  }
}

export default function TipJarScreen() {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={14}>
            <Ionicons name="close" size={26} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart" size={34} color="#e11d48" />
            </View>
            <Text style={styles.title}>Support the App</Text>
            <Text style={styles.subtitle}>
              This app is <Text style={styles.emphasis}>100% free — no ads, no paywalls</Text>,
              for every future citizen. The best way to support it is to help other
              people find it.
            </Text>
          </Animated.View>

          <View style={styles.grid}>
            <Animated.View entering={FadeInDown.delay(120).duration(400)}>
              <SupportCard
                icon="star"
                title="Rate the app"
                description="Leave a star rating — it helps other future citizens find it."
                actionLabel="Rate"
                onPress={openStoreListing}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(210).duration(400)}>
              <SupportCard
                icon="create"
                title="Write a review"
                description="Share a few words about your experience."
                actionLabel="Review"
                onPress={openStoreListing}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <SupportCard
                icon="share-social"
                title="Share with a friend"
                description="Know someone studying for the test? Send it their way."
                actionLabel="Share"
                highlight
                onPress={shareApp}
              />
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <Ionicons name="heart" size={14} color="#94a3b8" />
            <Text style={styles.footerText}>
              Free today, free tomorrow. Thank you for studying with us — good luck
              on your journey to citizenship!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function SupportCard({
  icon,
  title,
  description,
  actionLabel,
  onPress,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={26} color="#4f46e5" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <View style={[styles.actionButton, highlight && styles.actionButtonFilled]}>
        <Text style={[styles.actionText, highlight && styles.actionTextFilled]}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    height: 44,
  },
  container: { padding: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 28 },
  heartCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#1a1f36", marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 24, color: "#475569", textAlign: "center" },
  emphasis: { color: "#4f46e5", fontWeight: "700" },
  grid: { gap: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: { transform: [{ scale: 0.98 }], backgroundColor: "#fafaff" },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1a1f36" },
  cardDesc: { fontSize: 13, color: "#64748b", marginTop: 3, lineHeight: 18 },
  actionButton: {
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 76,
    alignItems: "center",
  },
  actionButtonFilled: { backgroundColor: "#4f46e5" },
  actionText: { color: "#4f46e5", fontWeight: "800", fontSize: 15 },
  actionTextFilled: { color: "#fff" },
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 4,
  },
  footerText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18 },
});
