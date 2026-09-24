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
import type { VoiceGender } from "@/services/speech";

const CYAN = "#06b6d4";
const SPEEDS = [0.75, 1.0, 1.25, 1.5];
const clampRate = (r: number) => Math.min(Math.max(r, 0.5), 2);

/**
 * Hands-free Listen Mode. Auto-plays each question, then all of its answers,
 * then advances — looping through the whole deck nonstop. The user can pick the
 * playback speed and a male/female voice; both apply immediately.
 */
export default function ListenScreen() {
  const { questions, settings, updateSettings } = useApp();
  const deck = questions;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState<"question" | "answer">("question");

  // A token guards against stale onDone callbacks after stop / manual nav.
  const token = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const q = deck[index];
    if (!q) return;

    const myToken = ++token.current;
    const rate = clampRate(settings.ttsRate);

    (async () => {
      speech.setVoiceGender(settings.voiceGender);
      const voice = await speech.getVoiceId();
      if (token.current !== myToken) return;

      setPhase("question");
      Speech.stop();
      Speech.speak(q.text, {
        language: "en-US",
        rate,
        voice,
        onDone: () => {
          if (token.current !== myToken) return;
          setPhase("answer");
          Speech.speak(q.answers.join(". "), {
            language: "en-US",
            rate,
            voice,
            onDone: () => {
              if (token.current !== myToken) return;
              setPhase("question");
              setIndex((i) => (i + 1) % deck.length);
            },
          });
        },
      });
    })();

    return () => {
      token.current++; // invalidate callbacks for this card
      Speech.stop();
    };
  }, [index, playing, deck, settings.ttsRate, settings.voiceGender]);

  useEffect(() => () => { Speech.stop(); }, []);

  const q = deck[index];
  if (!q) return null;

  const togglePlay = () => {
    if (playing) {
      token.current++;
      Speech.stop();
    }
    setPlaying((p) => !p);
  };

  const jump = (delta: number) => {
    token.current++;
    Speech.stop();
    setPhase("question");
    setIndex((i) => (i + delta + deck.length) % deck.length);
    setPlaying(true);
  };

  const nearestSpeed = SPEEDS.reduce((best, s) =>
    Math.abs(s - settings.ttsRate) < Math.abs(best - settings.ttsRate) ? s : best
  , SPEEDS[0]);

  const setSpeed = (s: number) => updateSettings({ ttsRate: s });
  const setVoice = (g: VoiceGender) => {
    speech.setVoiceGender(g);
    updateSettings({ voiceGender: g });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader
          title="Listen Mode"
          right={<Text style={styles.count}>{index + 1}/{deck.length}</Text>}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.pulse}>
            <Ionicons name={playing ? "radio" : "pause"} size={30} color={CYAN} />
          </View>
          <Text style={styles.phaseLabel}>
            {phase === "question" ? "QUESTION" : "ANSWER"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.question}>{q.text}</Text>
            {phase === "answer" && (
              <View style={styles.answerList}>
                {q.answers.map((a, i) => (
                  <View key={i} style={styles.answerRow}>
                    <Ionicons name="checkmark" size={15} color="#0e7490" />
                    <Text style={styles.answer}>{a}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.hint}>
            {playing ? "Playing hands-free — sit back and listen." : "Paused."}
          </Text>

          {/* Speed */}
          <Text style={styles.ctrlLabel}>Speed</Text>
          <View style={styles.chipRow}>
            {SPEEDS.map((s) => {
              const active = s === nearestSpeed;
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

          {/* Voice */}
          <Text style={styles.ctrlLabel}>Voice</Text>
          <View style={styles.chipRow}>
            {(["female", "male"] as VoiceGender[]).map((g) => {
              const active = settings.voiceGender === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.voiceChip, active && styles.chipActive]}
                  onPress={() => setVoice(g)}
                >
                  <Ionicons
                    name={g === "female" ? "woman" : "man"}
                    size={16}
                    color={active ? "#fff" : "#64748b"}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {g === "female" ? "Female" : "Male"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.sideBtn} onPress={() => jump(-1)}>
            <Ionicons name="play-skip-back" size={24} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Ionicons name={playing ? "pause" : "play"} size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => jump(1)}>
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
  hint: { fontSize: 13, color: "#334155", fontWeight: "600", textAlign: "center" },
  ctrlLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: "#475569", alignSelf: "flex-start" },
  chipRow: { flexDirection: "row", gap: 8, alignSelf: "stretch" },
  chip: {
    flex: 1, paddingVertical: 9, borderRadius: 12, backgroundColor: "#fff", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  voiceChip: {
    flex: 1, flexDirection: "row", gap: 6, paddingVertical: 9, borderRadius: 12, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e2e8f0",
  },
  chipActive: { backgroundColor: CYAN, borderColor: CYAN },
  chipText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  chipTextActive: { color: "#fff" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, paddingVertical: 16 },
  sideBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  playBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: CYAN, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: CYAN, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});
