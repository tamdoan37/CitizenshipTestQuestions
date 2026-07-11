import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { QuizSummary } from "@/components/QuizSummary";
import { CategoryBadge } from "@/components/CategoryBadge";
import { getWeightedQuestions } from "@/data/questions";
import {
  isAnswerCorrect,
  scoreQuiz,
  QUIZ_SIZE,
  PASS_THRESHOLD,
} from "@/services/scoring";
import type { Question, QuizResult } from "@/types";

const OPTIONS_PER_Q = 4;

type Phase = "start" | "question" | "result";

/**
 * Build 4 multiple-choice options for a question: its correct answer plus
 * plausible distractors pulled from other questions' primary answers.
 */
function buildOptions(correct: string, pool: Question[]): string[] {
  const opts = new Set<string>([correct]);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const q of shuffled) {
    if (opts.size >= OPTIONS_PER_Q) break;
    const candidate = q.answers[0];
    if (candidate && candidate !== correct && candidate.length < 60) {
      opts.add(candidate);
    }
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

export default function QuizScreen() {
  const { questions, recordAnswers, weightById } = useApp();
  const [phase, setPhase] = useState<Phase>("start");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<number, string[]>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedNow, setSelectedNow] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const startTime = useRef(0);

  const scale = useSharedValue(1);
  const questionAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // ── Start / restart ───────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    // Weighted draw: frequently-missed questions (higher weight) surface more
    // often. `questions` are already patched with live official names.
    const drawn = getWeightedQuestions(QUIZ_SIZE, weightById, questions);
    const opts: Record<number, string[]> = {};
    drawn.forEach((q) => {
      opts[q.id] = buildOptions(q.answers[0], questions);
    });
    setQuizQuestions(drawn);
    setOptionsMap(opts);
    setCurrentIdx(0);
    setUserAnswers({});
    setSelectedNow(null);
    startTime.current = Date.now();
    setPhase("question");
  }, [questions, weightById]);

  const currentQ = quizQuestions[currentIdx];
  const options = currentQ ? optionsMap[currentQ.id] ?? [] : [];
  const isLast = currentIdx === quizQuestions.length - 1;

  const liveScore = useMemo(() => {
    return quizQuestions.reduce(
      (score, q) => (isAnswerCorrect(q, userAnswers[q.id] ?? "") ? score + 1 : score),
      0
    );
  }, [quizQuestions, userAnswers]);

  const selectAnswer = useCallback(
    (answer: string) => {
      if (selectedNow) return; // locked after first tap
      Haptics.selectionAsync();
      setSelectedNow(answer);
      scale.value = withSpring(1.02, { damping: 12 }, () => {
        scale.value = withSpring(1);
      });
      setUserAnswers((prev) => ({ ...prev, [currentQ.id]: answer }));
    },
    [selectedNow, currentQ]
  );

  const finishQuiz = useCallback(() => {
    const duration = Date.now() - startTime.current;
    const r: QuizResult = scoreQuiz(quizQuestions, userAnswers, duration);

    // Persist every answer back into the tracking schema in one write.
    const correctIds = new Set(r.correctQuestions.map((q) => q.id));
    recordAnswers(
      quizQuestions.map((q) => ({
        questionId: q.id,
        wasCorrect: correctIds.has(q.id),
      }))
    );

    setResult(r);
    setPhase("result");
    Haptics.notificationAsync(
      r.passed
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  }, [quizQuestions, userAnswers, recordAnswers]);

  const next = useCallback(() => {
    if (!selectedNow) {
      Alert.alert("Choose an answer", "Please select an answer to continue.");
      return;
    }
    setSelectedNow(null);
    if (isLast) finishQuiz();
    else setCurrentIdx((i) => i + 1);
  }, [selectedNow, isLast, finishQuiz]);

  const optionStyle = useCallback(
    (opt: string) => {
      if (!selectedNow) return styles.option;
      const isCorrect = isAnswerCorrect(currentQ, opt);
      if (opt === selectedNow) {
        return [styles.option, isCorrect ? styles.optionCorrect : styles.optionWrong];
      }
      if (isCorrect) return [styles.option, styles.optionCorrect];
      return [styles.option, styles.optionDimmed];
    },
    [selectedNow, currentQ]
  );

  // ── START SCREEN ──────────────────────────────────────────────────
  if (phase === "start") {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.startContainer}>
          <View style={styles.startIcon}>
            <Ionicons name="school" size={60} color="#4f46e5" />
          </View>
          <Text style={styles.startTitle}>Civics Practice Test</Text>
          <Text style={styles.startSub}>
            {QUIZ_SIZE} questions drawn from the 128-question pool.{"\n"}
            Score{" "}
            <Text style={{ fontWeight: "800", color: "#4f46e5" }}>
              {PASS_THRESHOLD}+
            </Text>{" "}
            to pass — just like the real interview.
          </Text>

          <View style={styles.rulesCard}>
            {[
              `${QUIZ_SIZE} weighted questions (weak spots surface first)`,
              `Pass mark: ${PASS_THRESHOLD} / ${QUIZ_SIZE} correct`,
              "Live officials from your home state",
              "Missed questions saved for review",
            ].map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startQuiz}>
            <Text style={styles.startBtnText}>Start Test</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <QuizSummary
        result={result}
        onRetry={startQuiz}
        onHome={() => setPhase("start")}
      />
    );
  }

  if (!currentQ) return null;

  // ── QUESTION SCREEN ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setPhase("start")} hitSlop={12}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.topMeta}>
          <Text style={styles.topCounter}>
            {currentIdx + 1} / {quizQuestions.length}
          </Text>
          <View style={styles.scorePill}>
            <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
            <Text style={styles.scorePillText}>{liveScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.questionContainer}>
        <View style={styles.badgeRow}>
          <CategoryBadge category={currentQ.category} />
          <Text style={styles.questionNum}>Q{currentQ.number}</Text>
        </View>

        <Animated.View style={questionAnim}>
          <Text style={styles.questionText}>{currentQ.text}</Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {options.map((opt, i) => {
            const isSelected = selectedNow === opt;
            const isCorrect = selectedNow != null && isAnswerCorrect(currentQ, opt);
            return (
              <TouchableOpacity
                key={i}
                style={optionStyle(opt)}
                onPress={() => selectAnswer(opt)}
                activeOpacity={0.8}
                disabled={!!selectedNow}
              >
                <View style={styles.optionInner}>
                  <View
                    style={[
                      styles.optionLetter,
                      isSelected && !isCorrect && { backgroundColor: "#fee2e2" },
                      isCorrect && { backgroundColor: "#dcfce7" },
                    ]}
                  >
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                  {selectedNow && isCorrect && (
                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  )}
                  {isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, !selectedNow && styles.nextBtnDisabled]}
          onPress={next}
          disabled={!selectedNow}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Finish Test" : "Next Question"}
          </Text>
          <Ionicons
            name={isLast ? "flag" : "arrow-forward"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9ff" },
  startContainer: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  startIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  startTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1f36",
    marginBottom: 10,
  },
  startSub: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  rulesCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ruleText: { fontSize: 14, color: "#374151", flex: 1 },
  startBtn: {
    width: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  startBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topMeta: { flexDirection: "row", alignItems: "center", gap: 12 },
  topCounter: { fontSize: 14, fontWeight: "700", color: "#1a1f36" },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scorePillText: { fontSize: 13, fontWeight: "700", color: "#15803d" },
  progressTrack: {
    height: 4,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: { height: "100%", backgroundColor: "#4f46e5", borderRadius: 2 },
  questionContainer: { padding: 20, paddingBottom: 48 },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionNum: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1f36",
    lineHeight: 30,
    marginBottom: 28,
  },
  optionsContainer: { gap: 12, marginBottom: 28 },
  option: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionCorrect: { backgroundColor: "#f0fdf4", borderColor: "#16a34a" },
  optionWrong: { backgroundColor: "#fff1f2", borderColor: "#ef4444" },
  optionDimmed: { opacity: 0.45 },
  optionInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: { fontSize: 13, fontWeight: "700", color: "#4f46e5" },
  optionText: { fontSize: 15, color: "#1a1f36", flex: 1, lineHeight: 22 },
  nextBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnDisabled: { backgroundColor: "#c7d2fe" },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
