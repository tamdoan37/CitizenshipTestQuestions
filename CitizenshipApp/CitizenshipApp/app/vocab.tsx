import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { speech } from "@/services/speech";
import { useApp } from "@/context/AppContext";
import { VOCABULARY } from "@/data/vocabulary";

export default function VocabScreen() {
  const { settings } = useApp();
  const [index, setIndex] = useState(0);
  const [showDef, setShowDef] = useState(false);

  const item = VOCABULARY[index];

  const go = (delta: number) => {
    setShowDef(false);
    speech.stop();
    setIndex((i) => Math.min(Math.max(i + delta, 0), VOCABULARY.length - 1));
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader title="Vocabulary Drill" right={<Text style={styles.count}>{index + 1}/{VOCABULARY.length}</Text>} />

        <View style={styles.cardArea}>
          <Pressable style={styles.card} onPress={() => setShowDef((v) => !v)}>
            <Text style={styles.kicker}>{showDef ? "DEFINITION" : "TERM"}</Text>
            <Text style={showDef ? styles.def : styles.term}>
              {showDef ? item.definition : item.term}
            </Text>
            <View style={styles.cardFooter}>
              <TouchableOpacity
                onPress={() => speech.speak(showDef ? item.definition : item.term, settings.ttsRate)}
                hitSlop={10}
                style={styles.speak}
              >
                <Ionicons name="volume-high" size={20} color="#a855f7" />
              </TouchableOpacity>
              <Text style={styles.hint}>Tap to {showDef ? "hide" : "reveal"}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.nav}>
          <TouchableOpacity
            style={[styles.navBtn, index === 0 && styles.navDisabled]}
            onPress={() => go(-1)}
            disabled={index === 0}
          >
            <Ionicons name="arrow-back" size={20} color={index === 0 ? "#cbd5e1" : "#4f46e5"} />
            <Text style={[styles.navText, index === 0 && { color: "#cbd5e1" }]}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, index >= VOCABULARY.length - 1 && styles.navDisabled]}
            onPress={() => go(1)}
            disabled={index >= VOCABULARY.length - 1}
          >
            <Text style={[styles.navText, index >= VOCABULARY.length - 1 && { color: "#cbd5e1" }]}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={index >= VOCABULARY.length - 1 ? "#cbd5e1" : "#4f46e5"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  count: { fontSize: 14, fontWeight: "700", color: "#a855f7" },
  cardArea: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 26, minHeight: 240, justifyContent: "space-between",
    borderTopWidth: 5, borderTopColor: "#a855f7",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#a855f7" },
  term: { fontSize: 26, fontWeight: "800", color: "#1a1f36", flex: 1, textAlignVertical: "center", marginTop: 12 },
  def: { fontSize: 18, color: "#334155", lineHeight: 26, flex: 1, textAlignVertical: "center", marginTop: 12 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  speak: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#a855f71A", alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 12, color: "#94a3b8" },
  nav: { flexDirection: "row", gap: 12, padding: 20 },
  navBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#eef2ff", borderRadius: 12, paddingVertical: 13,
  },
  navDisabled: { backgroundColor: "#f1f5f9" },
  navText: { fontSize: 14, fontWeight: "600", color: "#4f46e5" },
});
