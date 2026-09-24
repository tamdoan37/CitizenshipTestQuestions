import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { BottomNav } from "@/components/BottomNav";
import { speech } from "@/services/speech";
import { useApp } from "@/context/AppContext";
import type { Question } from "@/types";

const GREEN = "#22c55e";

/** Shuffle a copy using the SRS weight to surface weaker questions first. */
function orderDeck(questions: Question[], weightById: Record<number, number>): Question[] {
  return [...questions].sort(
    (a, b) => (weightById[b.id] ?? 1) - (weightById[a.id] ?? 1)
  );
}

export default function OralPracticeScreen() {
  const { questions, weightById, settings, recordAnswer, preferredAnswers, togglePreferredAnswer } = useApp();
  const deck = useMemo(() => orderDeck(questions, weightById), [questions, weightById]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState(0);
  const [correct, setCorrect] = useState(0);

  const q = deck[index];
  if (!q) return null;

  const askAgain = () => speech.speak(q.text, settings.ttsRate);
  const hearAnswer = () => speech.speak(q.answers.join(". "), settings.ttsRate);

  const rate = (wasCorrect: boolean) => {
    recordAnswer(q.id, wasCorrect);
    setRated((n) => n + 1);
    if (wasCorrect) setCorrect((n) => n + 1);
    speech.stop();
    setRevealed(false);
    setIndex((i) => (i + 1) % deck.length);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader
          title="Oral Practice"
          right={<Text style={styles.count}>{correct}/{rated}</Text>}
        />

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.kicker}>QUESTION {index + 1}</Text>
            <Text style={styles.question}>{q.text}</Text>

            <TouchableOpacity style={styles.replay} onPress={askAgain}>
              <Ionicons name="volume-high" size={18} color={GREEN} />
              <Text style={styles.replayText}>Hear the question</Text>
            </TouchableOpacity>

            {revealed ? (
              <View style={styles.answerBox}>
                {q.answers.map((a, i) => {
                  const pinned = (preferredAnswers[q.id] ?? []).includes(a);
                  return (
                    <View key={i} style={styles.answerRow}>
                      <Ionicons name="checkmark" size={16} color="#16a34a" />
                      <Text style={styles.answerText}>{a}</Text>
                      <TouchableOpacity
                        onPress={() => speech.speak(a, settings.ttsRate)}
                        hitSlop={8}
                        accessibilityLabel="Read this answer aloud"
                      >
                        <Ionicons name="volume-medium" size={18} color="#16a34a" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => togglePreferredAnswer(q.id, a)}
                        hitSlop={8}
                        accessibilityLabel={pinned ? "Unpin answer" : "Pin easiest answer"}
                      >
                        <Ionicons
                          name={pinned ? "bookmark" : "bookmark-outline"}
                          size={18}
                          color="#f59e0b"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <TouchableOpacity style={styles.hearAnswer} onPress={hearAnswer}>
                  <Ionicons name="volume-high" size={16} color="#16a34a" />
                  <Text style={styles.hearAnswerText}>Hear all answers</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.prompt}>
                Say your answer out loud, then reveal to check.
              </Text>
            )}
          </View>
        </View>

        {revealed ? (
          <View style={styles.rateRow}>
            <TouchableOpacity style={[styles.rateBtn, styles.wrong]} onPress={() => rate(false)}>
              <Ionicons name="close" size={20} color="#dc2626" />
              <Text style={[styles.rateText, { color: "#dc2626" }]}>Got it wrong</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateBtn, styles.right]} onPress={() => rate(true)}>
              <Ionicons name="checkmark" size={20} color="#16a34a" />
              <Text style={[styles.rateText, { color: "#16a34a" }]}>Got it right</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)}>
            <Text style={styles.revealText}>Reveal answer</Text>
          </TouchableOpacity>
        )}
        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  count: { fontSize: 14, fontWeight: "700", color: GREEN },
  body: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 16,
    borderTopWidth: 5, borderTopColor: GREEN,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: GREEN },
  question: { fontSize: 22, fontWeight: "700", color: "#1a1f36", lineHeight: 30 },
  replay: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  replayText: { color: GREEN, fontWeight: "700", fontSize: 14 },
  prompt: { fontSize: 14, color: "#94a3b8", fontStyle: "italic" },
  answerBox: { gap: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 14 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  answerText: { flex: 1, fontSize: 16, color: "#15803d", fontWeight: "600", lineHeight: 22 },
  hearAnswer: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  hearAnswerText: { color: "#16a34a", fontWeight: "700", fontSize: 13 },
  revealBtn: { margin: 20, backgroundColor: GREEN, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  revealText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  rateRow: { flexDirection: "row", gap: 12, padding: 20 },
  rateBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, borderWidth: 1.5 },
  wrong: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  right: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  rateText: { fontWeight: "800", fontSize: 15 },
});
