import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { Mascot } from "@/components/Mascot";
import { useApp } from "@/context/AppContext";

type IconName = keyof typeof Ionicons.glyphMap;

interface Mode {
  title: string;
  desc: string;
  icon: IconName;
  color: string;
  href: Href;
}

const MODES: Mode[] = [
  { title: "Flashcards", desc: "Flip through all 128 questions", icon: "layers", color: "#2563eb", href: "/flashcards" },
  { title: "Quick Quiz", desc: "20 weighted questions, 12 to pass", icon: "checkmark-circle", color: "#f59e0b", href: "/quiz" },
  { title: "Mock Interview", desc: "Simulate the real USCIS interview", icon: "people", color: "#ef4444", href: "/mock-interview" },
  { title: "Oral Practice", desc: "Hear it, answer aloud, self-check", icon: "mic", color: "#22c55e", href: "/oral-practice" },
  { title: "Listen Mode", desc: "Hands-free audio of Q & A", icon: "headset", color: "#06b6d4", href: "/listen" },
  { title: "Read & Write", desc: "Practice the English portion", icon: "create", color: "#a855f7", href: "/read-write" },
];

const REFERENCE: Mode[] = [
  { title: "Quick Review", desc: "Browse answers by category", icon: "list", color: "#2563eb", href: "/review" },
  { title: "Vocabulary Drill", desc: "Key civics terms & meanings", icon: "book", color: "#a855f7", href: "/vocab" },
];

export default function StudyScreen() {
  const { trackers, settings } = useApp();

  const pct = useMemo(() => {
    if (!trackers.length) return 0;
    const mastered = trackers.filter((t) => t.correctStreak >= 2).length;
    return Math.round((mastered / trackers.length) * 100);
  }, [trackers]);

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

          {/* ── Study modes ── */}
          <Text style={styles.section}>Study Modes</Text>
          {MODES.map((m) => (
            <ModeCard key={m.title} mode={m} />
          ))}

          {/* ── Reference ── */}
          <Text style={styles.section}>Reference</Text>
          {REFERENCE.map((m) => (
            <ModeCard key={m.title} mode={m} />
          ))}

          {/* ── Focus ── */}
          <Text style={styles.section}>Focus</Text>
          <View style={styles.grid}>
            <FocusCard
              title="Weak spots"
              icon="star"
              color="#f59e0b"
              onPress={() => router.push("/weak-spots")}
            />
            <FocusCard
              title="2025 updates"
              icon="sparkles"
              color="#2563eb"
              onPress={() => router.push("/updates")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ModeCard({ mode }: { mode: Mode }) {
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
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

function FocusCard({
  title, icon, color, onPress,
}: { title: string; icon: IconName; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.focusCard} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.modeIcon, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.focusTitle}>{title}</Text>
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
  bannerHi: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  bannerTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800", marginTop: 2 },
  progressTrack: {
    height: 8, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 4, overflow: "hidden", marginTop: 10,
  },
  progressFill: { height: "100%", backgroundColor: "#f59e0b", borderRadius: 4 },
  bannerPct: { color: "#cbd5e1", fontSize: 12, fontWeight: "600", marginTop: 6 },
  section: {
    fontSize: 13, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase",
    color: "#64748b", marginTop: 20, marginBottom: 10, marginLeft: 4,
  },
  modeCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, borderLeftWidth: 5,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  modeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modeTitle: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  modeDesc: { fontSize: 13, color: "#64748b", marginTop: 2 },
  grid: { flexDirection: "row", gap: 12 },
  focusCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  focusTitle: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
});
