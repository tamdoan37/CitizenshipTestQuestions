import React from "react";
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
import { useApp } from "@/context/AppContext";

export default function HistoryScreen() {
  const { quizHistory, clearQuizHistory } = useApp();

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

            {quizHistory.map((h, i) => {
              const pct = Math.round((h.score / h.total) * 100);
              return (
                <View
                  key={`${h.date}-${i}`}
                  style={[styles.row, { borderLeftColor: h.passed ? "#16a34a" : "#ef4444" }]}
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
                  <Text style={styles.rowTime}>{formatDuration(h.durationSeconds)}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
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
  title: { fontSize: 20, fontWeight: "800", color: "#1a1f36" },
  clear: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  scroll: { padding: 16, paddingBottom: 40, gap: 10 },
  summary: { flexDirection: "row", gap: 10, marginBottom: 8 },
  tile: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  tileVal: { fontSize: 20, fontWeight: "700" },
  tileLbl: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase", color: "#9ca3af", marginTop: 4 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 12, padding: 14, borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  badge: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "800" },
  rowMain: { flex: 1 },
  rowScore: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  rowDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  rowTime: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyText: { fontSize: 15, color: "#94a3b8", textAlign: "center", lineHeight: 22 },
  emptyBtn: { backgroundColor: "#4f46e5", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
