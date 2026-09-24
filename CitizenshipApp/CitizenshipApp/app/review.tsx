import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { ModeHeader } from "@/components/ModeHeader";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import type { Question } from "@/types";

export default function ReviewScreen() {
  const { questions } = useApp();
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const grouped = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const q of questions) {
      const arr = map.get(q.category) ?? [];
      arr.push(q);
      map.set(q.category, arr);
    }
    return Array.from(map.entries());
  }, [questions]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ModeHeader title="Quick Review" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {grouped.map(([category, qs]) => (
            <View key={category} style={styles.group}>
              <Text style={styles.groupTitle}>{category}</Text>
              {qs.map((q) => {
                const isOpen = !!open[q.id];
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={styles.row}
                    activeOpacity={0.85}
                    onPress={() => setOpen((o) => ({ ...o, [q.id]: !o[q.id] }))}
                  >
                    <View style={styles.rowHead}>
                      <Text style={styles.qNum}>Q{q.number}</Text>
                      <Text style={styles.qText}>{q.text}</Text>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#94a3b8"
                      />
                    </View>
                    {isOpen && (
                      <View style={styles.answers}>
                        {q.answers.map((a, i) => (
                          <View key={i} style={styles.answerRow}>
                            <Ionicons name="checkmark" size={14} color="#16a34a" />
                            <Text style={styles.answerText}>{a}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
        <BottomNav />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  group: { marginBottom: 18 },
  groupTitle: {
    fontSize: 12, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase",
    color: "#64748b", marginBottom: 8, marginLeft: 4,
  },
  row: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  rowHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  qNum: { fontSize: 12, fontWeight: "800", color: "#4f46e5", width: 34 },
  qText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1a1f36", lineHeight: 19 },
  answers: { marginTop: 10, gap: 6, paddingLeft: 44 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  answerText: { flex: 1, fontSize: 14, color: "#15803d", fontWeight: "500", lineHeight: 19 },
});
