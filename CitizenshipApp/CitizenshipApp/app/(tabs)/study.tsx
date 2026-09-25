import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { Mascot } from "@/components/Mascot";
import { useApp } from "@/context/AppContext";
import { STUDY_MODES, type StudyMode } from "@/data/studyModes";

export default function StudyScreen() {
  const { trackers, settings, toggleFavoriteMode } = useApp();

  const pct = useMemo(() => {
    if (!trackers.length) return 0;
    const mastered = trackers.filter((t) => t.correctStreak >= 2).length;
    return Math.round((mastered / trackers.length) * 100);
  }, [trackers]);

  const favSet = useMemo(
    () => new Set(settings.favoriteModes ?? []),
    [settings.favoriteModes]
  );
  // Only modes shown on this tab can be picked (Flashcards/Quiz live on the Dashboard).
  const favModes = useMemo(
    () => STUDY_MODES.filter((m) => m.group !== "quick" && favSet.has(m.key)),
    [favSet]
  );
  const practiceModes = STUDY_MODES.filter((m) => m.group === "practice");
  const referenceModes = STUDY_MODES.filter((m) => m.group === "reference");

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Top banner ── */}
          <View style={styles.banner}>
            <Mascot size={56} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerHi}>Hi {settings.userName} 👋</Text>
              <Text style={styles.bannerTitle}>Start your journey</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.bannerPct}>{pct}% mastered</Text>
            </View>
          </View>

          {/* ── Your picks ── */}
          <Text style={styles.section}>Your Picks</Text>
          {favModes.length > 0 ? (
            favModes.map((m) => (
              <ModeCard
                key={m.key}
                mode={m}
                isFav
                onToggleFav={() => toggleFavoriteMode(m.key)}
              />
            ))
          ) : (
            <View style={styles.pickHint}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
              <Text style={styles.pickHintText}>
                Tap the ☆ on any mode below to add it to your picks for quick access.
              </Text>
            </View>
          )}

          {/* ── Practice ── */}
          <Text style={styles.section}>Practice</Text>
          {practiceModes.map((m) => (
            <ModeCard
              key={m.key}
              mode={m}
              isFav={favSet.has(m.key)}
              onToggleFav={() => toggleFavoriteMode(m.key)}
            />
          ))}

          {/* ── Reference ── */}
          <Text style={styles.section}>Reference</Text>
          {referenceModes.map((m) => (
            <ModeCard
              key={m.key}
              mode={m}
              isFav={favSet.has(m.key)}
              onToggleFav={() => toggleFavoriteMode(m.key)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ModeCard({
  mode, isFav, onToggleFav,
}: { mode: StudyMode; isFav: boolean; onToggleFav: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.modeCard, { borderLeftColor: mode.color }]}
      activeOpacity={0.85}
      onPress={() => router.push(mode.href)}
    >
      <View style={[styles.modeIcon, { backgroundColor: mode.color + "1A" }]}>
        <Ionicons name={mode.icon} size={22} color={mode.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modeTitle}>{mode.title}</Text>
        <Text style={styles.modeDesc}>{mode.desc}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggleFav}
        hitSlop={10}
        style={styles.starBtn}
        accessibilityLabel={isFav ? `Remove ${mode.title} from your picks` : `Add ${mode.title} to your picks`}
      >
        <Ionicons
          name={isFav ? "star" : "star-outline"}
          size={22}
          color={isFav ? "#f59e0b" : "#cbd5e1"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  banner: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#0f172a", borderRadius: 16, padding: 18, marginBottom: 8,
  },
  bannerHi: { color: "#cbd5e1", fontSize: 13, fontWeight: "600" },
  bannerTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800", marginTop: 2 },
  progressTrack: {
    height: 8, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 4, overflow: "hidden", marginTop: 10,
  },
  progressFill: { height: "100%", backgroundColor: "#f59e0b", borderRadius: 4 },
  bannerPct: { color: "#e2e8f0", fontSize: 12, fontWeight: "600", marginTop: 6 },
  section: {
    fontSize: 13, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase",
    color: "#1e293b", marginTop: 20, marginBottom: 10, marginLeft: 4,
    textShadowColor: "rgba(255,255,255,0.7)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
  },
  pickHint: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fffbeb", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#fde68a",
  },
  pickHintText: { flex: 1, fontSize: 13, color: "#92400e", lineHeight: 18 },
  modeCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, borderLeftWidth: 5,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  modeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modeTitle: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  modeDesc: { fontSize: 13, color: "#64748b", marginTop: 2 },
  starBtn: { padding: 2 },
});
