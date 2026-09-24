import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { BottomNav } from "@/components/BottomNav";

const POINTS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: "documents",
    title: "128 questions (2020 version)",
    body: "The 2025 test uses the 128-question civics pool. This app studies all 128.",
  },
  {
    icon: "help-circle",
    title: "20 asked · 12 to pass",
    body: "At the interview the officer asks up to 20 questions; you must answer 12 correctly.",
  },
  {
    icon: "people",
    title: "Current officials matter",
    body: "Answers about the President, VP, Speaker, Chief Justice, your governor and senators must name whoever is serving at your interview. Keep your home state set correctly.",
  },
  {
    icon: "calendar",
    title: "Who takes this version",
    body: "Applicants whose Form N-400 was received on or after October 20, 2025 take the 2025 (128-question) test.",
  },
  {
    icon: "book",
    title: "English test too",
    body: "Besides civics, you'll read one sentence aloud and write one sentence. Practice these in Read & Write.",
  },
];

export default function UpdatesScreen() {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader title="2025 Test Updates" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Ionicons name="sparkles" size={28} color="#2563eb" />
            <Text style={styles.heroText}>What changed for the 2025 civics test</Text>
          </View>
          {POINTS.map((p) => (
            <View key={p.title} style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={p.icon} size={22} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardBody}>{p.body}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.footnote}>
            Always confirm current answers at uscis.gov/citizenship/testupdates.
          </Text>
        </ScrollView>
        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  hero: { alignItems: "center", gap: 8, marginBottom: 4 },
  heroText: { fontSize: 16, fontWeight: "700", color: "#1a1f36", textAlign: "center" },
  card: {
    flexDirection: "row", gap: 14, backgroundColor: "#fff", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: "#2563eb1A",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  cardBody: { fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 19 },
  footnote: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 8 },
});
