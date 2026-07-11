import React from "react";
import {
  ActivityIndicator,
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
import { TIP_TIERS, useTipJar, type TipTier } from "@/hooks/useTipJar";

export default function TipJarScreen() {
  const {
    isLoading,
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
            This app is 100% free — every question, quiz, and flashcard, for
            every future citizen. If it's helped you on your journey, a small
            tip keeps it{" "}
            <Text style={styles.emphasis}>ad-free and open to all immigrants</Text>.
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

        {/* ── Tip tiers ───────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading tip options…</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {TIP_TIERS.map((tier, i) => (
              <Animated.View
                key={tier.id}
                entering={FadeInDown.delay(120 + i * 90).duration(400)}
              >
                <TipCard
                  tier={tier}
                  price={priceFor(tier.id)}
                  disabled={isProcessingPayment}
                  onPress={() => requestTip(tier.id)}
                />
              </Animated.View>
            ))}
          </View>
        )}

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
  );
}

// ── Tip tier card ─────────────────────────────────────────────────────
function TipCard({
  tier,
  price,
  disabled,
  onPress,
}: {
  tier: TipTier;
  price: string;
  disabled: boolean;
  onPress: () => void;
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
        <Ionicons name={tier.icon} size={26} color="#4f46e5" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{tier.title}</Text>
        <Text style={styles.cardDesc}>{tier.description}</Text>
      </View>
      <View style={styles.priceButton}>
        <Text style={styles.priceText}>{price}</Text>
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
  root: { flex: 1, backgroundColor: "#f8f9ff" },
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
