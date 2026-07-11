import React from "react";
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { QuizResult } from "@/types";
import { CategoryBadge } from "./CategoryBadge";

interface Props {
  result: QuizResult;
  onRetry: () => void;
  onHome: () => void;
}

export function QuizSummary({ result, onRetry, onHome }: Props) {
  const pct = Math.round((result.score / result.total) * 100);
  const mins = Math.floor(result.duration / 60000);
  const secs = Math.round((result.duration % 60000) / 1000);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      {/* Result banner */}
      <View style={[styles.banner, result.passed ? styles.passBanner : styles.failBanner]}>
        <Ionicons
          name={result.passed ? "checkmark-circle" : "close-circle"}
          size={64}
          color="#fff"
        />
        <Text style={styles.bannerTitle}>
          {result.passed ? "Congratulations!" : "Almost There!"}
        </Text>
        <Text style={styles.bannerSub}>
          {result.passed
            ? "You passed the civics test"
            : "You need 12/20 to pass. Keep practicing!"}
        </Text>
      </View>

      {/* Score ring */}
      <View style={styles.scoreCard}>
        <View style={[styles.scoreRing, result.passed ? styles.passRing : styles.failRing]}>
          <Text style={styles.scorePct}>{pct}%</Text>
          <Text style={styles.scoreRaw}>{result.score}/{result.total}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.metaText}>{result.score} correct</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="close-circle" size={18} color="#ef4444" />
            <Text style={styles.metaText}>{result.total - result.score} missed</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="time" size={18} color="#6366f1" />
            <Text style={styles.metaText}>{mins}m {secs}s</Text>
          </View>
        </View>
      </View>

      {/* Missed questions review */}
      {result.missedQuestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions to Review</Text>
          {result.missedQuestions.map(q => (
            <View key={q.id} style={styles.missedCard}>
              <View style={styles.missedHeader}>
                <CategoryBadge category={q.category} />
                <Text style={styles.missedNum}>#{q.number}</Text>
              </View>
              <Text style={styles.missedQ}>{q.text}</Text>
              <View style={styles.answerBox}>
                <Text style={styles.answerLabel}>Correct answer:</Text>
                <Text style={styles.answerText}>{q.answers[0]}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
          <Ionicons name="home" size={18} color="#6366f1" />
          <Text style={styles.homeText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9ff" },
  container: { padding: 20, paddingBottom: 48 },
  banner: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
  },
  passBanner: { backgroundColor: "#22c55e" },
  failBanner: { backgroundColor: "#6366f1" },
  bannerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
  bannerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    textAlign: "center",
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scoreRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  passRing: { borderColor: "#22c55e" },
  failRing: { borderColor: "#ef4444" },
  scorePct: { fontSize: 28, fontWeight: "800", color: "#1a1f36" },
  scoreRaw: { fontSize: 13, color: "#64748b" },
  metaRow: { flexDirection: "row", gap: 20 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, color: "#475569", fontWeight: "500" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1f36",
    marginBottom: 12,
  },
  missedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  missedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  missedNum: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  missedQ: { fontSize: 15, color: "#1a1f36", fontWeight: "600", marginBottom: 10, lineHeight: 22 },
  answerBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 10,
  },
  answerLabel: { fontSize: 11, color: "#16a34a", fontWeight: "600", marginBottom: 2 },
  answerText: { fontSize: 14, color: "#15803d", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
  retryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 16,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  homeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingVertical: 16,
  },
  homeText: { color: "#6366f1", fontWeight: "700", fontSize: 15 },
});
