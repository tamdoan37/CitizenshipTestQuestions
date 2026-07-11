import React, { useCallback, useEffect } from "react";
import {
  Dimensions,
  Pressable,
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
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
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
  // 0 = showing question, 1 = showing answer.
  const progress = useSharedValue(0);
  const flipped = useSharedValue(false);

  // Reset to the question side whenever the card changes.
  useEffect(() => {
    progress.value = withTiming(0, { duration: 0 });
    flipped.value = false;
    Speech.stop();
  }, [question.id]);

  const flip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const goingToAnswer = !flipped.value;
    progress.value = withTiming(goingToAnswer ? 1 : 0, {
      duration: 480,
      easing: Easing.inOut(Easing.ease),
    });
    flipped.value = goingToAnswer;
    if (goingToAnswer) onReveal?.();
  }, [onReveal]);

  const speak = useCallback(() => {
    Haptics.selectionAsync();
    Speech.stop();
    Speech.speak(question.text, {
      language: "en-US",
      rate: ttsRate,
      pitch: 1.0,
    });
  }, [question.text, ttsRate]);

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
      <Animated.View style={[styles.card, styles.front, frontStyle]}>
        <Pressable onPress={flip} style={styles.inner}>
          <View style={styles.header}>
            <CategoryBadge category={question.category} />
            <Text style={styles.number}>#{question.number}</Text>
          </View>

          <Text style={styles.question}>{question.text}</Text>

          <Text style={styles.hint}>Tap the card to flip</Text>

          <TouchableOpacity
            onPress={speak}
            style={styles.speaker}
            hitSlop={12}
            accessibilityLabel="Read question aloud"
          >
            <Ionicons name="volume-high" size={22} color="#4f46e5" />
          </TouchableOpacity>
        </Pressable>
      </Animated.View>

      {/* ── BACK: acceptable answers ────────────────────── */}
      <Animated.View style={[styles.card, styles.back, backStyle]}>
        <Pressable onPress={flip} style={styles.inner}>
          <View style={styles.header}>
            <CategoryBadge category={question.category} />
            <Text style={[styles.number, { color: "#a5b4fc" }]}>
              #{question.number}
            </Text>
          </View>

          <Text style={styles.answerLabel}>Acceptable Answers</Text>

          <View style={styles.answerList}>
            {question.answers.map((answer, i) => (
              <View key={i} style={styles.answerRow}>
                <View style={styles.bullet} />
                <Text style={styles.answerText}>{answer}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.hint, { color: "#c7d2fe" }]}>
            Tap to flip back
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
  answerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a5b4fc",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 8,
  },
  answerList: { flex: 1, justifyContent: "center", gap: 10 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#818cf8",
    marginTop: 7,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 23,
  },
});
