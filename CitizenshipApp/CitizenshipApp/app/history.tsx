import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";

export default function HistoryScreen() {
  const { quizHistory, clearQuizHistory } = useApp();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const passed = quizHistory.filter((h) => h.passed).length;
  const best = quizHistory.reduce(
    (m, h) => Math.max(m, Math.round((h.score / h.total) * 100)),
    0
  );

  function formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={24} color="#4f46e5" />
          </TouchableOpacity>
          <Text style={styles.title}>Quiz History</Text>
          {quizHistory.length > 0 ? (
            <TouchableOpacity onPress={clearQuizHistory} hitSlop={10}>
              <Text style={styles.clear}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {quizHistory.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={64} color="#c7d2fe" />
            <Text style={styles.emptyText}>
              No quizzes yet. Take a practice test to start tracking your progress!
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace("/quiz")}>
              <Text style={styles.emptyBtnText}>Take a Quiz</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.summary}>
              <Tile value={String(quizHistory.length)} label="Taken" color="#1a1f36" />
              <Tile value={String(passed)} label="Passed" color="#16a34a" />
              <Tile value={`${best}%`} label="Best" color="#4f46e5" />
            </View>

            <Text style={styles.hint}>Tap an attempt to review the questions you missed.</Text>

            {quizHistory.map((h, i) => {
              const pct = Math.round((h.score / h.total) * 100);
              const key = `${h.date}-${i}`;
              const isOpen = !!open[key];
              const missCount = h.total - h.score;
              const reviewable = Array.isArray(h.missed);
              return (
                <View
                  key={key}
                  style={[styles.row, { borderLeftColor: h.passed ? "#16a34a" : "#ef4444" }]}
                >
                  <TouchableOpacity
                    style={styles.rowHead}
                    activeOpacity={0.85}
                    onPress={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                  >
                    <View style={[styles.badge, { backgroundColor: h.passed ? "#dcfce7" : "#fee2e2" }]}>
                      <Text style={[styles.badgeText, { color: h.passed ? "#15803d" : "#b91c1c" }]}>
                        {pct}%
                      </Text>
                    </View>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowScore}>
                        {h.score}/{h.total} correct ·{" "}
                        <Text style={{ color: h.passed ? "#16a34a" : "#ef4444" }}>
                          {h.passed ? "Passed" : "Failed"}
                        </Text>
                      </Text>
                      <Text style={styles.rowDate}>{formatDate(h.date)}</Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowTime}>{formatDuration(h.durationSeconds)}</Text>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#94a3b8"
                      />
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.reviewBox}>
                      {!reviewable ? (
                        <Text style={styles.reviewNote}>
                          Review details weren't saved for this older attempt.
                        </Text>
                      ) : missCount === 0 || h.missed!.length === 0 ? (
                        <Text style={styles.reviewPerfect}>Perfect score — no misses! 🎉</Text>
                      ) : (
                        h.missed!.map((m) => (
                          <View key={m.id} style={styles.missItem}>
                            <Text style={styles.missQ}>
                              Q{m.number}. {m.text}
                            </Text>
                            {!!m.your && (
                              <View style={styles.ansLine}>
                                <Ionicons name="close-circle" size={14} color="#ef4444" />
                                <Text style={styles.ansYour}>You: {m.your}</Text>
                              </View>
                            )}
                            <View style={styles.ansLine}>
                              <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                              <Text style={styles.ansCorrect}>Correct: {m.correct}</Text>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

function Tile({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileVal, { color }]}>{value}</Text>
      <Text style={styles.tileLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20, fontWeight: "800", color: "#0f172a",
    textShadowColor: "rgba(255,255,255,0.75)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5,
  },
  clear: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  scroll: { padding: 16, paddingBottom: 40, gap: 10 },
  summary: { flexDirection: "row", gap: 10, marginBottom: 4 },
  tile: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  tileVal: { fontSize: 20, fontWeight: "700" },
  tileLbl: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase", color: "#9ca3af", marginTop: 4 },
  hint: {
    fontSize: 12, color: "#0f172a", fontWeight: "600", marginLeft: 4, marginBottom: 2,
    textShadowColor: "rgba(255,255,255,0.8)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5,
  },
  row: {
    backgroundColor: "#fff", borderRadius: 12, borderLeftWidth: 4, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  rowHead: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  badge: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "800" },
  rowMain: { flex: 1 },
  rowScore: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  rowDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowTime: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  reviewBox: {
    paddingHorizontal: 14, paddingBottom: 12, paddingTop: 2, gap: 10,
    borderTopWidth: 1, borderTopColor: "#f1f5f9",
  },
  reviewNote: { fontSize: 12, color: "#94a3b8", fontStyle: "italic", paddingTop: 10 },
  reviewPerfect: { fontSize: 13, color: "#16a34a", fontWeight: "600", paddingTop: 10 },
  missItem: { paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f8fafc", gap: 3 },
  missQ: { fontSize: 13, fontWeight: "600", color: "#1a1f36", lineHeight: 18 },
  ansLine: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  ansYour: { flex: 1, fontSize: 13, color: "#b91c1c", lineHeight: 18 },
  ansCorrect: { flex: 1, fontSize: 13, color: "#15803d", fontWeight: "500", lineHeight: 18 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyText: { fontSize: 15, color: "#1e293b", fontWeight: "500", textAlign: "center", lineHeight: 22 },
  emptyBtn: { backgroundColor: "#4f46e5", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
