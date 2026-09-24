import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { useTipJar } from "@/hooks/useTipJar";
import { ScreenBackground } from "@/components/ScreenBackground";

const ESPRESSO_ID = "org.citizenship.tip.espresso";
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

export default function TipJarScreen() {
  const {
    isProcessingPayment,
    hasTipped,
    error,
    justCompleted,
    requestTip,
    dismissCelebration,
    priceFor,
  } = useTipJar();

  // ── Celebration / success state ───────────────────────────────────
  if (justCompleted) {
    return <CelebrationView onClose={() => { dismissCelebration(); router.back(); }} />;
  }

  return (
    <ScreenBackground>
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* Close affordance */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={14}>
          <Ionicons name="close" size={26} color="#64748b" />
        </TouchableOpacity>
        {hasTipped && (
          <View style={styles.supporterPill}>
            <Ionicons name="star" size={13} color="#f59e0b" />
            <Text style={styles.supporterPillText}>Supporter</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.heartCircle}>
            <Ionicons name="heart" size={34} color="#e11d48" />
          </View>
          <Text style={styles.title}>Support the App</Text>
          <Text style={styles.subtitle}>
            This app is 100% free for every future citizen. If it's helped you,
            here are three easy ways to support it — {""}
            <Text style={styles.emphasis}>rate it, write a review, or buy me an espresso</Text>.
            Never required, always appreciated.
          </Text>
        </Animated.View>

        {/* ── Error banner ────────────────────────────────── */}
        {error && (
          <Animated.View entering={FadeIn} style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* ── Support options ─────────────────────────────── */}
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
              icon="cafe"
              title="Buy me an espresso"
              description="A tiny thank-you that keeps the app free and ad-free."
              actionLabel={priceFor(ESPRESSO_ID)}
              highlight
              disabled={isProcessingPayment}
              onPress={() => requestTip(ESPRESSO_ID)}
            />
          </Animated.View>
        </View>

        {/* ── Compliance / reassurance footer ─────────────── */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={14} color="#94a3b8" />
          <Text style={styles.footerText}>
            Payments are handled securely by the App Store / Google Play. Tips
            are one-time and unlock no content — the entire app stays free.
          </Text>
        </View>
      </ScrollView>

      {/* ── Processing overlay ───────────────────────────── */}
      {isProcessingPayment && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.overlayText}>Opening payment…</Text>
            <Text style={styles.overlaySub}>
              Confirm in the {`${platformSheetName()}`} sheet
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
    </ScreenBackground>
  );
}

// ── Support option card ───────────────────────────────────────────────
function SupportCard({
  icon,
  title,
  description,
  actionLabel,
  onPress,
  disabled,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        pressed && !disabled && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={26} color="#4f46e5" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <View style={[styles.priceButton, !highlight && styles.actionButton]}>
        <Text style={[styles.priceText, !highlight && styles.actionText]}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

// ── Full-screen celebration ───────────────────────────────────────────
function CelebrationView({ onClose }: { onClose: () => void }) {
  return (
    <SafeAreaView style={styles.celebrationRoot}>
      <Animated.View
        entering={ZoomIn.duration(420)}
        style={styles.celebrationContent}
      >
        <View style={styles.celebrationBadge}>
          <Ionicons name="star" size={56} color="#f59e0b" />
        </View>
        <Text style={styles.celebrationTitle}>Thank you!</Text>
        <Text style={styles.celebrationBody}>
          Thank you for supporting future citizens! Your generosity keeps this
          app free and open for everyone studying for their moment.
        </Text>
        <View style={styles.supporterBadgeRow}>
          <Ionicons name="star" size={15} color="#f59e0b" />
          <Text style={styles.supporterBadgeText}>
            You're now a Supporter — a gold star now shines on your dashboard.
          </Text>
        </View>
        <TouchableOpacity style={styles.celebrationBtn} onPress={onClose}>
          <Text style={styles.celebrationBtnText}>You're Welcome 🇺🇸</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function platformSheetName(): string {
  return "secure payment";
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
  supporterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  supporterPillText: { fontSize: 12, fontWeight: "700", color: "#b45309" },
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
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748b",
    textAlign: "center",
  },
  emphasis: { color: "#4f46e5", fontWeight: "700" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: "#b91c1c", lineHeight: 18 },
  loadingBlock: { alignItems: "center", paddingVertical: 48, gap: 14 },
  loadingText: { fontSize: 14, color: "#94a3b8" },
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
  cardDisabled: { opacity: 0.55 },
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
  priceButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 72,
    alignItems: "center",
  },
  priceText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  // Rate / Review use an outline treatment; the espresso tip stays filled.
  actionButton: { backgroundColor: "#eef2ff" },
  actionText: { color: "#4f46e5" },
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 4,
  },
  footerText: { flex: 1, fontSize: 12, color: "#94a3b8", lineHeight: 18 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,17,23,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 12,
  },
  overlayText: { fontSize: 16, fontWeight: "700", color: "#1a1f36" },
  overlaySub: { fontSize: 13, color: "#94a3b8" },
  // Celebration
  celebrationRoot: {
    flex: 1,
    backgroundColor: "#312e81",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  celebrationContent: { alignItems: "center" },
  celebrationBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(245,158,11,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(245,158,11,0.4)",
  },
  celebrationTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 14,
  },
  celebrationBody: {
    fontSize: 16,
    lineHeight: 25,
    color: "#c7d2fe",
    textAlign: "center",
    marginBottom: 24,
  },
  supporterBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 36,
  },
  supporterBadgeText: {
    flex: 1,
    fontSize: 13,
    color: "#e0e7ff",
    lineHeight: 19,
  },
  celebrationBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  celebrationBtnText: { fontSize: 16, fontWeight: "800", color: "#312e81" },
});
