import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { BottomNav } from "@/components/BottomNav";
import { speech } from "@/services/speech";
import { useApp } from "@/context/AppContext";
import type { Question } from "@/types";

const RED = "#ef4444";
const PASS_MARK = 12; // correct answers needed to pass
const MAX_QUESTIONS = 20; // officer asks up to 20
const FAIL_MARK = MAX_QUESTIONS - PASS_MARK + 1; // 9 wrong → cannot reach 12

/** Weighted-random selection of up to MAX_QUESTIONS unique questions. */
function pickInterview(questions: Question[], weightById: Record<number, number>): Question[] {
  const pool = [...questions];
  const picked: Question[] = [];
  const weights = pool.map((q) => Math.max(weightById[q.id] ?? 1, 0.1));
  while (picked.length < MAX_QUESTIONS && pool.length > 0) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    const safeIdx = Math.min(idx, pool.length - 1);
    picked.push(pool[safeIdx]);
    pool.splice(safeIdx, 1);
    weights.splice(safeIdx, 1);
  }
  return picked;
}

export default function MockInterviewScreen() {
  const { questions, weightById, settings, recordAnswers, preferredAnswers, togglePreferredAnswer } = useApp();

  const [sessionKey, setSessionKey] = useState(0);
  const deck = useMemo(
    () => pickInterview(questions, weightById),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, questions]
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Array<{ questionId: number; wasCorrect: boolean }>>([]);

  const q = deck[index];

  const finish = (finalResults: Array<{ questionId: number; wasCorrect: boolean }>) => {
    speech.stop();
    recordAnswers(finalResults);
    setDone(true);
  };

  const answer = (wasCorrect: boolean) => {
    const nextResults = [...results, { questionId: q.id, wasCorrect }];
    const nextCorrect = correct + (wasCorrect ? 1 : 0);
    const nextWrong = wrong + (wasCorrect ? 0 : 1);
    setResults(nextResults);
    setCorrect(nextCorrect);
    setWrong(nextWrong);

    // Early stop: passed, failed, or ran out of questions.
    if (nextCorrect >= PASS_MARK || nextWrong >= FAIL_MARK || index + 1 >= deck.length) {
      finish(nextResults);
      return;
    }
    speech.stop();
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    speech.stop();
    setSessionKey((k) => k + 1);
    setIndex(0);
    setRevealed(false);
    setCorrect(0);
    setWrong(0);
    setDone(false);
    setResults([]);
  };

  if (done) {
    const passed = correct >= PASS_MARK;
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
          <ModeHeader title="Mock Interview" />
          <View style={styles.resultBody}>
            <View style={[styles.resultBadge, { backgroundColor: passed ? "#f0fdf4" : "#fef2f2" }]}>
              <Ionicons
                name={passed ? "checkmark-circle" : "close-circle"}
                size={72}
                color={passed ? "#16a34a" : RED}
              />
            </View>
            <Text style={styles.resultTitle}>{passed ? "You passed!" : "Keep practicing"}</Text>
            <Text style={styles.resultScore}>
              {correct} correct · {wrong} incorrect
            </Text>
            <Text style={styles.resultNote}>
              {passed
                ? `You reached ${PASS_MARK} correct answers — that's a passing score on the real civics test.`
                : `You need ${PASS_MARK} correct out of 20. Review your weak spots and try again.`}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={restart}>
              <Text style={styles.primaryText}>New interview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace("/study")}>
              <Text style={styles.secondaryText}>Back to Study</Text>
            </TouchableOpacity>
          </View>
          <BottomNav />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (!q) return null;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader
          title="Mock Interview"
          right={
            <View style={styles.tally}>
              <Text style={styles.tallyGood}>{correct}✓</Text>
              <Text style={styles.tallyBad}>{wrong}✗</Text>
            </View>
          }
        />

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Question {index + 1} · need {PASS_MARK} correct
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <Ionicons name="person-circle" size={40} color={RED} style={{ alignSelf: "center" }} />
            <Text style={styles.officer}>The officer asks:</Text>
            <Text style={styles.question}>{q.text}</Text>
            <TouchableOpacity style={styles.replay} onPress={() => speech.speak(q.text, settings.ttsRate)}>
              <Ionicons name="volume-high" size={18} color={RED} />
              <Text style={styles.replayText}>Hear it</Text>
            </TouchableOpacity>

            {revealed && (
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
              </View>
            )}
          </View>
        </View>

        {revealed ? (
          <View style={styles.rateRow}>
            <TouchableOpacity style={[styles.rateBtn, styles.wrongBtn]} onPress={() => answer(false)}>
              <Ionicons name="close" size={20} color="#dc2626" />
              <Text style={[styles.rateText, { color: "#dc2626" }]}>Missed it</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateBtn, styles.rightBtn]} onPress={() => answer(true)}>
              <Ionicons name="checkmark" size={20} color="#16a34a" />
              <Text style={[styles.rateText, { color: "#16a34a" }]}>Got it</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)}>
            <Text style={styles.revealText}>Show answer</Text>
          </TouchableOpacity>
        )}
        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tally: { flexDirection: "row", gap: 8 },
  tallyGood: { fontSize: 14, fontWeight: "800", color: "#16a34a" },
  tallyBad: { fontSize: 14, fontWeight: "800", color: RED },
  progressRow: { paddingHorizontal: 20, paddingBottom: 4 },
  progressText: { fontSize: 13, color: "#334155", fontWeight: "700" },
  body: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  answerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 14,
    borderTopWidth: 5, borderTopColor: RED,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  officer: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textAlign: "center", letterSpacing: 0.5 },
  question: { fontSize: 22, fontWeight: "700", color: "#1a1f36", textAlign: "center", lineHeight: 30 },
  replay: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center" },
  replayText: { color: RED, fontWeight: "700", fontSize: 14 },
  answerBox: { gap: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 14 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  answerText: { flex: 1, fontSize: 16, color: "#15803d", fontWeight: "600", lineHeight: 22 },
  revealBtn: { margin: 20, backgroundColor: RED, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  revealText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  rateRow: { flexDirection: "row", gap: 12, padding: 20 },
  rateBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, borderWidth: 1.5 },
  wrongBtn: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  rightBtn: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  rateText: { fontWeight: "800", fontSize: 15 },
  resultBody: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 14 },
  resultBadge: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: 26, fontWeight: "800", color: "#1a1f36" },
  resultScore: { fontSize: 16, fontWeight: "700", color: "#475569" },
  resultNote: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20, paddingHorizontal: 8 },
  primaryBtn: { backgroundColor: RED, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 40, marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryBtn: { paddingVertical: 10 },
  secondaryText: { color: "#64748b", fontWeight: "700", fontSize: 15 },
});
