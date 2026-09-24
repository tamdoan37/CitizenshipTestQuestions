import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { BottomNav } from "@/components/BottomNav";
import { speech } from "@/services/speech";
import { useApp } from "@/context/AppContext";
import { READING, WRITING } from "@/data/fluency";

type Mode = "reading" | "writing";

export default function ReadWriteScreen() {
  const { settings } = useApp();
  const [mode, setMode] = useState<Mode>("reading");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const deck = useMemo(() => (mode === "reading" ? READING : WRITING), [mode]);
  const item = deck[index];

  const switchMode = (m: Mode) => {
    speech.stop();
    setMode(m);
    setIndex(0);
    setRevealed(false);
  };

  const go = (delta: number) => {
    speech.stop();
    setRevealed(false);
    setIndex((i) => Math.min(Math.max(i + delta, 0), deck.length - 1));
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader title="Read & Write" right={<Text style={styles.count}>{index + 1}/{deck.length}</Text>} />

        <View style={styles.toggle}>
          {(["reading", "writing"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleActive]}
              onPress={() => switchMode(m)}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === "reading" ? "Reading" : "Writing"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cardArea}>
          {mode === "reading" ? (
            <View style={styles.card}>
              <Text style={styles.kicker}>READ THIS ALOUD</Text>
              <Text style={styles.sentence}>{item.text}</Text>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => speech.speak(item.text, settings.ttsRate)}
              >
                <Ionicons name="volume-high" size={20} color="#fff" />
                <Text style={styles.playText}>Hear it</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.kicker}>WRITE WHAT YOU HEAR</Text>
              <TouchableOpacity
                style={styles.playBtnOutline}
                onPress={() => speech.speak(item.text, settings.ttsRate)}
              >
                <Ionicons name="volume-high" size={20} color="#a855f7" />
                <Text style={styles.playTextOutline}>Play sentence</Text>
              </TouchableOpacity>
              {revealed ? (
                <Text style={styles.sentence}>{item.text}</Text>
              ) : (
                <Text style={styles.hidden}>Write it down, then check yourself.</Text>
              )}
              <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed((v) => !v)}>
                <Text style={styles.revealText}>{revealed ? "Hide sentence" : "Show sentence"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.nav}>
          <TouchableOpacity style={[styles.navBtn, index === 0 && styles.navDisabled]} onPress={() => go(-1)} disabled={index === 0}>
            <Ionicons name="arrow-back" size={20} color={index === 0 ? "#cbd5e1" : "#4f46e5"} />
            <Text style={[styles.navText, index === 0 && { color: "#cbd5e1" }]}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, index >= deck.length - 1 && styles.navDisabled]} onPress={() => go(1)} disabled={index >= deck.length - 1}>
            <Text style={[styles.navText, index >= deck.length - 1 && { color: "#cbd5e1" }]}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={index >= deck.length - 1 ? "#cbd5e1" : "#4f46e5"} />
          </TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  count: { fontSize: 14, fontWeight: "700", color: "#a855f7" },
  toggle: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "#eef2ff", alignItems: "center" },
  toggleActive: { backgroundColor: "#a855f7" },
  toggleText: { fontSize: 14, fontWeight: "700", color: "#6b7280" },
  toggleTextActive: { color: "#fff" },
  cardArea: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 26, minHeight: 220, justifyContent: "center", gap: 18,
    borderTopWidth: 5, borderTopColor: "#a855f7",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#a855f7", textAlign: "center" },
  sentence: { fontSize: 22, fontWeight: "700", color: "#1a1f36", textAlign: "center", lineHeight: 30 },
  hidden: { fontSize: 15, color: "#94a3b8", textAlign: "center", fontStyle: "italic" },
  playBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#a855f7", borderRadius: 12, paddingVertical: 12, alignSelf: "center", paddingHorizontal: 22,
  },
  playText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  playBtnOutline: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#a855f7", borderRadius: 12, paddingVertical: 12, alignSelf: "center", paddingHorizontal: 22,
  },
  playTextOutline: { color: "#a855f7", fontWeight: "700", fontSize: 15 },
  revealBtn: { alignSelf: "center" },
  revealText: { color: "#6b7280", fontWeight: "600", fontSize: 13 },
  nav: { flexDirection: "row", gap: 12, padding: 20 },
  navBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#eef2ff", borderRadius: 12, paddingVertical: 13 },
  navDisabled: { backgroundColor: "#f1f5f9" },
  navText: { fontSize: 14, fontWeight: "600", color: "#4f46e5" },
});
