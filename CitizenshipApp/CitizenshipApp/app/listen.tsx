import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { useApp } from "@/context/AppContext";

const CYAN = "#06b6d4";

/**
 * Hands-free Listen Mode. Auto-plays each question, then its answer, then
 * advances to the next card. Uses Speech.speak's onDone callback to chain
 * utterances so it keeps flowing while the screen is open.
 */
export default function ListenScreen() {
  const { questions, settings } = useApp();
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
    const rate = Math.min(Math.max(settings.ttsRate, 0.5), 2);

    const speakAnswer = () => {
      if (token.current !== myToken) return;
      setPhase("answer");
      Speech.speak(q.answers[0], {
        language: "en-US",
        rate,
        onDone: () => {
          if (token.current !== myToken) return;
          // Pause a beat, then advance.
          setPhase("question");
          setIndex((i) => (i + 1) % deck.length);
        },
      });
    };

    setPhase("question");
    Speech.stop();
    Speech.speak(q.text, {
      language: "en-US",
      rate,
      onDone: () => {
        if (token.current !== myToken) return;
        speakAnswer();
      },
    });

    return () => {
      token.current++; // invalidate callbacks for this card
      Speech.stop();
    };
  }, [index, playing, deck, settings.ttsRate]);

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

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader
          title="Listen Mode"
          right={<Text style={styles.count}>{index + 1}/{deck.length}</Text>}
        />

        <View style={styles.body}>
          <View style={styles.pulse}>
            <Ionicons name={playing ? "radio" : "pause"} size={30} color={CYAN} />
          </View>
          <Text style={styles.phaseLabel}>
            {phase === "question" ? "QUESTION" : "ANSWER"}
          </Text>
          <View style={styles.card}>
            <Text style={styles.question}>{q.text}</Text>
            {phase === "answer" && <Text style={styles.answer}>{q.answers[0]}</Text>}
          </View>
          <Text style={styles.hint}>
            {playing ? "Playing hands-free — sit back and listen." : "Paused."}
          </Text>
        </View>

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
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  count: { fontSize: 14, fontWeight: "700", color: CYAN },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  pulse: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#06b6d41A",
    alignItems: "center", justifyContent: "center",
  },
  phaseLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5, color: CYAN },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 26, width: "100%", gap: 14, minHeight: 180, justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  question: { fontSize: 21, fontWeight: "700", color: "#1a1f36", textAlign: "center", lineHeight: 29 },
  answer: { fontSize: 18, fontWeight: "600", color: "#0e7490", textAlign: "center", lineHeight: 25 },
  hint: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, padding: 24 },
  sideBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: CYAN, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: CYAN, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});
