import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { useApp } from "@/context/AppContext";

export default function WeakSpotsScreen() {
  const { questions, trackers, recordAnswer } = useApp();
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const weak = useMemo(() => {
    const byId = new Map(trackers.map((t) => [t.questionId, t]));
    return questions
      .map((q) => ({ q, t: byId.get(q.id) }))
      .filter(({ t }) => t && t.timesAnswered > 0 && (t.correctStreak === 0 || t.weight > 1.5))
      .sort((a, b) => (b.t?.weight ?? 0) - (a.t?.weight ?? 0));
  }, [questions, trackers]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader title="Weak Spots" />
        {weak.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="star" size={56} color="#f59e0b" />
            <Text style={styles.emptyTitle}>No weak spots yet</Text>
            <Text style={styles.emptyText}>
              Take a quiz or use flashcards — questions you miss will show up here for focused review.
            </Text>
            <TouchableOpacity style={styles.cta} onPress={() => router.replace("/quiz")}>
              <Text style={styles.ctaText}>Take a Quiz</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>
              {weak.length} question{weak.length === 1 ? "" : "s"} to focus on — tap to reveal, then mark once you know it.
            </Text>
            {weak.map(({ q }) => {
              const isOpen = !!open[q.id];
              return (
                <View key={q.id} style={styles.card}>
                  <TouchableOpacity
                    style={styles.rowHead}
                    activeOpacity={0.85}
                    onPress={() => setOpen((o) => ({ ...o, [q.id]: !o[q.id] }))}
                  >
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.qText}>{q.text}</Text>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#94a3b8" />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.body}>
                      {q.answers.map((a, i) => (
                        <View key={i} style={styles.answerRow}>
                          <Ionicons name="checkmark" size={14} color="#16a34a" />
                          <Text style={styles.answerText}>{a}</Text>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.gotIt}
                        onPress={() => {
                          recordAnswer(q.id, true);
                          setOpen((o) => ({ ...o, [q.id]: false }));
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                        <Text style={styles.gotItText}>I know this now</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  lead: { fontSize: 14, color: "#475569", marginBottom: 12, lineHeight: 20 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#f59e0b",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  rowHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  qText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1a1f36", lineHeight: 19 },
  body: { marginTop: 10, gap: 6 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  answerText: { flex: 1, fontSize: 14, color: "#15803d", fontWeight: "500", lineHeight: 19 },
  gotIt: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#dcfce7", borderRadius: 10, paddingVertical: 10, marginTop: 8,
  },
  gotItText: { color: "#15803d", fontWeight: "700", fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1a1f36" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center", lineHeight: 20 },
  cta: { backgroundColor: "#4f46e5", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 6 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
