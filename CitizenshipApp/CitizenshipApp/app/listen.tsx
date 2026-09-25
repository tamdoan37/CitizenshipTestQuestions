import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { BottomNav } from "@/components/BottomNav";
import { speech } from "@/services/speech";
import { useApp } from "@/context/AppContext";
import type { Question } from "@/types";

const CYAN = "#06b6d4";
const SPEEDS = [0.5, 0.75, 1.0, 1.25];
const clampRate = (r: number) => Math.min(Math.max(r, 0.5), 2);
const nearestSpeed = (r: number) =>
  SPEEDS.reduce((best, s) => (Math.abs(s - r) < Math.abs(best - r) ? s : best), SPEEDS[0]);

/**
 * Weighted-random pick across all questions. Higher SRS weight (questions the
 * user misses more) → chosen more often, so important/weak ones repeat more.
 * Never returns the same question twice in a row.
 */
function pickWeighted(
  qs: Question[],
  weightById: Record<number, number>,
  excludeId?: number
): Question {
  const pool = excludeId != null ? qs.filter((q) => q.id !== excludeId) : qs;
  if (pool.length === 0) return qs[0];
  const weights = pool.map((q) => Math.max(weightById[q.id] ?? 1, 0.2));
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/**
 * Hands-free Listen Mode. Shuffles through all 128 questions weighted by how
 * often you miss them, auto-playing each question then its answers, nonstop.
 * A per-utterance watchdog advances even if the platform never fires onDone
 * (a web/Chrome quirk). Voice is chosen in Settings; speed is local here.
 */
export default function ListenScreen() {
  const { questions, weightById, settings } = useApp();

  const [current, setCurrent] = useState<Question>(() => pickWeighted(questions, weightById));
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState<"question" | "answer">("question");
  const [speed, setSpeed] = useState<number>(() => nearestSpeed(settings.ttsRate));

  const history = useRef<Question[]>([]);
  const token = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const q = current;
    if (!q) return;

    const myToken = ++token.current;
    const rate = clampRate(speed);
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let voice: string | undefined;

    const estimateMs = (text: string) => {
      const words = text.trim().split(/\s+/).length || 1;
      return Math.max(2500, (words / (2.4 * rate)) * 1000 + 1400);
    };

    const speakStep = (text: string, onDone: () => void) => {
      if (token.current !== myToken) return;
      let finished = false;
      const finish = () => {
        if (finished || token.current !== myToken) return;
        finished = true;
        if (watchdog) clearTimeout(watchdog);
        onDone();
      };
      Speech.speak(text, {
        language: "en-US",
        rate,
        voice,
        onDone: finish,
        onStopped: () => { if (watchdog) clearTimeout(watchdog); },
        onError: finish,
      });
      watchdog = setTimeout(finish, estimateMs(text));
    };

    (async () => {
      speech.setVoiceGender(settings.voiceGender);
      voice = await speech.getVoiceId();
      if (token.current !== myToken) return;
      setPhase("question");
      Speech.stop();
      speakStep(q.text, () => {
        setPhase("answer");
        speakStep(q.answers.join(". "), () => {
          // Advance to the next weighted-random question.
          history.current.push(q);
          if (history.current.length > 200) history.current.shift();
          setPhase("question");
          setCurrent(pickWeighted(questions, weightById, q.id));
        });
      });
    })();

    return () => {
      token.current++;
      if (watchdog) clearTimeout(watchdog);
      Speech.stop();
    };
  }, [current, playing, speed, settings.voiceGender, questions, weightById]);

  useEffect(() => () => { Speech.stop(); }, []);

  const togglePlay = () => {
    if (playing) {
      token.current++;
      Speech.stop();
    }
    setPlaying((p) => !p);
  };

  const goNext = () => {
    token.current++;
    Speech.stop();
    history.current.push(current);
    setPhase("question");
    setCurrent(pickWeighted(questions, weightById, current.id));
    setPlaying(true);
  };

  const goPrev = () => {
    token.current++;
    Speech.stop();
    setPhase("question");
    const prev = history.current.pop();
    setCurrent(prev ?? pickWeighted(questions, weightById, current.id));
    setPlaying(true);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader
          title="Listen Mode"
          right={<Text style={styles.count}>#{current.number}</Text>}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.pulse}>
            <Ionicons name={playing ? "radio" : "pause"} size={30} color={CYAN} />
          </View>
          <Text style={styles.phaseLabel}>
            {phase === "question" ? "QUESTION" : "ANSWER"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.question}>{current.text}</Text>
            {phase === "answer" && (
              <View style={styles.answerList}>
                {current.answers.map((a, i) => (
                  <View key={i} style={styles.answerRow}>
                    <Ionicons name="checkmark" size={15} color="#0e7490" />
                    <Text style={styles.answer}>{a}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.hint}>
            {playing
              ? "Shuffling all 128 — questions you miss more play more often."
              : "Paused. Press play to resume."}
          </Text>

          {/* Speed */}
          <Text style={styles.ctrlLabel}>Speed</Text>
          <View style={styles.chipRow}>
            {SPEEDS.map((s) => {
              const active = s === speed;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSpeed(s)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}x</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.sideBtn} onPress={goPrev}>
            <Ionicons name="play-skip-back" size={24} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Ionicons name={playing ? "pause" : "play"} size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={goNext}>
            <Ionicons name="play-skip-forward" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  count: { fontSize: 14, fontWeight: "700", color: CYAN },
  scroll: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 12, gap: 14, flexGrow: 1, justifyContent: "center" },
  pulse: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#06b6d41A",
    alignItems: "center", justifyContent: "center",
  },
  phaseLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5, color: CYAN },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", gap: 12, minHeight: 150, justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  question: { fontSize: 21, fontWeight: "700", color: "#1a1f36", textAlign: "center", lineHeight: 29 },
  answerList: { gap: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 14 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  answer: { flex: 1, fontSize: 16, fontWeight: "600", color: "#0e7490", lineHeight: 22 },
  hint: {
    fontSize: 13, color: "#1e293b", fontWeight: "600", textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.7)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
  },
  ctrlLabel: {
    fontSize: 12, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: "#334155", alignSelf: "flex-start",
    textShadowColor: "rgba(255,255,255,0.7)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
  },
  chipRow: { flexDirection: "row", gap: 8, alignSelf: "stretch" },
  chip: {
    flex: 1, paddingVertical: 9, borderRadius: 12, backgroundColor: "#fff", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  chipActive: { backgroundColor: CYAN, borderColor: CYAN },
  chipText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  chipTextActive: { color: "#fff" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, paddingVertical: 16 },
  sideBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  playBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: CYAN, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: CYAN, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});
