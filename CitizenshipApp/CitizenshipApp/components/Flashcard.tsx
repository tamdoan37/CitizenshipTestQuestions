import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { haptics } from "@/services/haptics";
import { speech } from "@/services/speech";
import { useApp } from "@/context/AppContext";
import { CategoryBadge } from "./CategoryBadge";
import type { Question } from "@/types";

const { width } = Dimensions.get("window");
const CARD_W = width - 48;
const CARD_H = 340;

interface Props {
  question: Question;
  ttsRate?: number;
  /** Fired the first time this card is flipped to its answer side. */
  onReveal?: () => void;
}

export function Flashcard({ question, ttsRate = 0.9, onReveal }: Props) {
  const { preferredAnswers, togglePreferredAnswer } = useApp();
  const [showAll, setShowAll] = useState(false);
  // React state mirror of the flip, used to toggle pointerEvents so the
  // invisible face never intercepts touches (opacity:0 does NOT block touches
  // in RN, and the back face is painted on top).
  const [isBack, setIsBack] = useState(false);

  // 0 = showing question, 1 = showing answer.
  const progress = useSharedValue(0);
  const flipped = useSharedValue(false);

  const pinned = preferredAnswers[question.id] ?? [];
  const preferredList = question.answers.filter((a) => pinned.includes(a));
  const otherList = question.answers.filter((a) => !pinned.includes(a));
  const hasPreferred = preferredList.length > 0;

  // Reset to the question side whenever the card changes.
  useEffect(() => {
    progress.value = withTiming(0, { duration: 0 });
    flipped.value = false;
    setIsBack(false);
    setShowAll(false);
    speech.stop();
  }, [question.id]);

  const flip = useCallback(() => {
    haptics.impact();
    const goingToAnswer = !flipped.value;
    progress.value = withTiming(goingToAnswer ? 1 : 0, {
      duration: 480,
      easing: Easing.inOut(Easing.ease),
    });
    flipped.value = goingToAnswer;
    setIsBack(goingToAnswer);
    if (goingToAnswer) onReveal?.();
  }, [onReveal]);

  const speak = useCallback(() => {
    haptics.selection();
    speech.speak(question.text, ttsRate);
  }, [question.text, ttsRate]);

  // Read every answer currently shown on the back (preferred set if pinned,
  // otherwise all acceptable answers), separated so TTS pauses between them.
  const speakAnswer = useCallback(() => {
    haptics.selection();
    const list = hasPreferred ? preferredList : question.answers;
    speech.speak(list.join(". "), ttsRate);
  }, [hasPreferred, preferredList, question.answers, ttsRate]);

  // Read a single answer aloud — used when the user taps one specific answer.
  const speakOne = useCallback(
    (answer: string) => {
      haptics.selection();
      speech.speak(answer, ttsRate);
    },
    [ttsRate]
  );

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(progress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden",
      opacity: progress.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(progress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden",
      opacity: progress.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <View style={{ width: CARD_W, height: CARD_H }}>
      {/* ── FRONT: question ─────────────────────────────── */}
      <Animated.View
        style={[styles.card, styles.front, frontStyle]}
        pointerEvents={isBack ? "none" : "auto"}
      >
        <Pressable onPress={flip} style={styles.inner}>
          <View style={styles.header}>
            <CategoryBadge category={question.category} />
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={speak}
                style={styles.headerSpeaker}
                hitSlop={10}
                accessibilityLabel="Read question aloud"
              >
                <Ionicons name="volume-high" size={20} color="#4f46e5" />
              </TouchableOpacity>
              <Text style={styles.number}>#{question.number}</Text>
            </View>
          </View>

          <Text style={styles.question}>{question.text}</Text>

          <Text style={styles.hint}>Tap the card to flip</Text>
        </Pressable>
      </Animated.View>

      {/* ── BACK: acceptable answers ────────────────────── */}
      <Animated.View
        style={[styles.card, styles.back, backStyle]}
        pointerEvents={isBack ? "auto" : "none"}
      >
        <Pressable onPress={flip} style={styles.inner}>
          <View style={styles.header}>
            <CategoryBadge category={question.category} />
            <Text style={[styles.number, { color: "#a5b4fc" }]}>
              #{question.number}
            </Text>
          </View>

          <View style={styles.answerLabelRow}>
            <Text style={styles.answerLabel}>
              {hasPreferred ? "Your Selected Answers" : "Acceptable Answers"}
            </Text>
            <TouchableOpacity
              onPress={speakAnswer}
              hitSlop={10}
              style={styles.hearAll}
              accessibilityLabel="Read all answers aloud"
            >
              <Ionicons name="volume-high" size={16} color="#312e81" />
              <Text style={styles.hearAllText}>Hear all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.answerList}
            contentContainerStyle={styles.answerListContent}
            showsVerticalScrollIndicator={false}
          >
            {(hasPreferred ? preferredList : question.answers).map((answer, i) => (
              <Pressable
                key={`p${i}`}
                style={styles.answerRow}
                onPress={() => speakOne(answer)}
                accessibilityLabel={`Read answer: ${answer}`}
              >
                <View style={styles.bullet} />
                <Text style={styles.answerText}>{answer}</Text>
                <TouchableOpacity
                  onPress={() => speakOne(answer)}
                  hitSlop={8}
                  accessibilityLabel="Read this answer aloud"
                >
                  <Ionicons name="volume-medium" size={17} color="#c7d2fe" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => togglePreferredAnswer(question.id, answer)}
                  hitSlop={8}
                  accessibilityLabel={hasPreferred ? "Unpin answer" : "Pin answer"}
                >
                  <Ionicons
                    name={hasPreferred ? "bookmark" : "bookmark-outline"}
                    size={17}
                    color="#fbbf24"
                  />
                </TouchableOpacity>
              </Pressable>
            ))}

            {hasPreferred && otherList.length > 0 && (
              <>
                <TouchableOpacity onPress={() => setShowAll((v) => !v)} hitSlop={6}>
                  <Text style={styles.showAll}>
                    {showAll
                      ? "▲ Hide extra answers"
                      : `▼ Show all acceptable answers (${otherList.length})`}
                  </Text>
                </TouchableOpacity>
                {showAll &&
                  otherList.map((answer, i) => (
                    <Pressable
                      key={`o${i}`}
                      style={styles.answerRow}
                      onPress={() => speakOne(answer)}
                      accessibilityLabel={`Read answer: ${answer}`}
                    >
                      <View style={styles.bullet} />
                      <Text style={[styles.answerText, { opacity: 0.75 }]}>{answer}</Text>
                      <TouchableOpacity
                        onPress={() => speakOne(answer)}
                        hitSlop={8}
                        accessibilityLabel="Read this answer aloud"
                      >
                        <Ionicons name="volume-medium" size={17} color="#a5b4fc" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => togglePreferredAnswer(question.id, answer)}
                        hitSlop={8}
                        accessibilityLabel="Pin answer"
                      >
                        <Ionicons name="bookmark-outline" size={17} color="#a5b4fc" />
                      </TouchableOpacity>
                    </Pressable>
                  ))}
              </>
            )}
          </ScrollView>

          <Text style={[styles.hint, { color: "#c7d2fe" }]}>
            Tap an answer to hear it · 🔖 pin your easiest
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  front: { backgroundColor: "#ffffff" },
  back: { backgroundColor: "#312e81" },
  inner: { flex: 1, padding: 24, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  number: { fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerSpeaker: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#eef2ff",
    alignItems: "center", justifyContent: "center",
  },
  question: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1f36",
    lineHeight: 32,
    marginVertical: 16,
  },
  hint: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  speaker: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  answerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a5b4fc",
    letterSpacing: 1,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  // "Hear all" pill next to the label — reads every shown answer aloud.
  hearAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e0e7ff",
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  hearAllText: { fontSize: 12, fontWeight: "700", color: "#312e81" },
  answerList: { flex: 1, marginVertical: 8 },
  answerListContent: { gap: 10, flexGrow: 1, justifyContent: "center" },
  showAll: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 4,
  },
  answerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#818cf8",
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 23,
  },
});
