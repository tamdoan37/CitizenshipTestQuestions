import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { QUESTIONS, CATEGORIES } from "@/data/questions";
import { loadSupporterFlag } from "@/services/supporter";
import type { Category } from "@/types";

export default function Dashboard() {
  const {
    trackers,
    questions,
    civicsData,
    settings,
    isLoadingCivics,
    refreshCivicsData,
  } = useApp();

  // ── Aggregate progress metrics from the tracker array ───────────────
  const metrics = useMemo(() => {
    const attempted = trackers.filter((t) => t.timesAnswered > 0);
    const mastered = trackers.filter((t) => t.correctStreak >= 2);
    const totalAnswers = trackers.reduce((s, t) => s + t.timesAnswered, 0);
    const coverage = Math.round((attempted.length / QUESTIONS.length) * 100);
    const masteryPct = Math.round((mastered.length / QUESTIONS.length) * 100);
    return {
      attempted: attempted.length,
      mastered: mastered.length,
      totalAnswers,
      coverage,
      masteryPct,
    };
  }, [trackers]);

  // ── Per-category mastery scores ─────────────────────────────────────
  const categoryScores = useMemo(() => {
    const trackerById = new Map(trackers.map((t) => [t.questionId, t]));
    return (CATEGORIES as Category[]).map((category) => {
      const inCat = QUESTIONS.filter((q) => q.category === category);
      const mastered = inCat.filter((q) => {
        const t = trackerById.get(q.id);
        return t && t.correctStreak >= 2;
      }).length;
      return {
        category,
        total: inCat.length,
        mastered,
        pct: Math.round((mastered / inCat.length) * 100),
      };
    });
  }, [trackers]);

  // ── Weakest questions surface first (highest weight) ────────────────
  const weakestCount = useMemo(
    () => trackers.filter((t) => t.weight > 1.5).length,
    [trackers]
  );

  // ── Supporter badge (refreshes when returning from the Tip Jar) ─────
  const [isSupporter, setIsSupporter] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSupporterFlag().then((flag) => {
        if (active) setIsSupporter(flag);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingCivics}
            onRefresh={() => refreshCivicsData(true)}
            tintColor="#4f46e5"
          />
        }
      >
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.greeting}>Good{timeOfDay()},</Text>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Future Citizen 🇺🇸</Text>
                {isSupporter && (
                  <View style={styles.supporterStar}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.tipButton}
              onPress={() => router.push("/tip-jar")}
              activeOpacity={0.85}
              accessibilityLabel="Open Tip Jar"
            >
              <Ionicons name="heart" size={18} color="#e11d48" />
            </TouchableOpacity>
            <View style={styles.masteryBadge}>
              <Text style={styles.masteryPct}>{metrics.masteryPct}%</Text>
              <Text style={styles.masteryLabel}>mastered</Text>
            </View>
          </View>
        </View>

        {/* ── Live officials banner ─────────────────────── */}
        {civicsData && (
          <View style={styles.officials}>
            <Text style={styles.officialsTitle}>
              Live Officials · {settings.homeState}
            </Text>
            <View style={styles.officialsGrid}>
              <Official title="President" name={civicsData.president} />
              <Official title="Vice President" name={civicsData.vicePresident} />
              <Official title="Governor" name={civicsData.governor} />
              <Official
                title="Senator"
                name={civicsData.senators[0] ?? "—"}
              />
            </View>
          </View>
        )}

        {/* ── Daily metric tiles ────────────────────────── */}
        <View style={styles.metricsRow}>
          <Metric
            icon="albums"
            value={`${metrics.attempted}/${QUESTIONS.length}`}
            label="Questions Seen"
            color="#4f46e5"
          />
          <Metric
            icon="ribbon"
            value={metrics.mastered}
            label="Mastered"
            color="#16a34a"
          />
          <Metric
            icon="flame"
            value={weakestCount}
            label="Need Review"
            color="#ef4444"
          />
        </View>

        {/* ── Overall coverage bar ──────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Overall Coverage</Text>
            <Text style={styles.cardPct}>{metrics.coverage}%</Text>
          </View>
          <ProgressBar pct={metrics.coverage} color="#4f46e5" />
          <Text style={styles.cardSub}>
            {metrics.totalAnswers} total answers recorded
          </Text>
        </View>

        {/* ── Category scores ───────────────────────────── */}
        <Text style={styles.sectionTitle}>Category Scores</Text>
        <View style={styles.card}>
          {categoryScores.map((c, i) => (
            <View
              key={c.category}
              style={[
                styles.catRow,
                i < categoryScores.length - 1 && styles.catRowBorder,
              ]}
            >
              <View style={styles.catInfo}>
                <Text style={styles.catName} numberOfLines={1}>
                  {c.category}
                </Text>
                <Text style={styles.catCount}>
                  {c.mastered}/{c.total}
                </Text>
              </View>
              <View style={styles.catBarTrack}>
                <View
                  style={[
                    styles.catBarFill,
                    { width: `${c.pct}%`, backgroundColor: barColor(c.pct) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Quick actions ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Quick Study</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.action, { backgroundColor: "#4f46e5" }]}
            onPress={() => router.push("/flashcards")}
            activeOpacity={0.85}
          >
            <Ionicons name="layers" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Flashcards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.action, { backgroundColor: "#16a34a" }]}
            onPress={() => router.push("/quiz")}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Take Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Small presentational helpers ──────────────────────────────────────
function Official({ title, name }: { title: string; name: string }) {
  return (
    <View style={styles.official}>
      <Text style={styles.officialRole}>{title}</Text>
      <Text style={styles.officialName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function Metric({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

function barColor(pct: number): string {
  if (pct >= 70) return "#16a34a";
  if (pct >= 35) return "#f59e0b";
  return "#ef4444";
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return " morning";
  if (h < 17) return " afternoon";
  return " evening";
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9ff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  greeting: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  title: { fontSize: 24, fontWeight: "800", color: "#1a1f36" },
  supporterStar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  tipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
  },
  masteryBadge: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  masteryPct: { fontSize: 20, fontWeight: "800", color: "#4f46e5" },
  masteryLabel: { fontSize: 10, color: "#818cf8", fontWeight: "600" },
  officials: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#312e81",
    borderRadius: 20,
    padding: 16,
  },
  officialsTitle: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  officialsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  official: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    flex: 1,
    minWidth: "44%",
  },
  officialRole: {
    color: "#818cf8",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
  officialName: { color: "#fff", fontSize: 13, fontWeight: "700" },
  metricsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    gap: 8,
  },
  metric: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  metricValue: { fontSize: 20, fontWeight: "700", color: "#1a1f36" },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    textAlign: "center",
  },
  card: {
    margin: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  cardPct: { fontSize: 15, fontWeight: "800", color: "#4f46e5" },
  cardSub: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  barTrack: {
    height: 8,
    backgroundColor: "#eef2ff",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1f36",
    marginLeft: 24,
    marginTop: 12,
    marginBottom: 4,
  },
  catRow: { paddingVertical: 12 },
  catRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  catInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  catName: { fontSize: 14, fontWeight: "600", color: "#334155", flex: 1 },
  catCount: { fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  catBarTrack: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  catBarFill: { height: "100%", borderRadius: 3 },
  actionsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
    marginTop: 12,
    paddingBottom: 32,
  },
  action: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 10,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  actionLabel: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
