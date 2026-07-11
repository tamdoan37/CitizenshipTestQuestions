import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Flashcard } from "@/components/Flashcard";
import { useApp } from "@/context/AppContext";
import { CATEGORIES } from "@/data/questions";
import type { Category } from "@/types";

export default function FlashcardsScreen() {
  const { questions, settings, recordAnswer } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [currentIndex, setCurrentIndex] = useState(0);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return questions;
    return questions.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  const current = filtered[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, filtered.length - 1));
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const selectCategory = useCallback((cat: Category | "All") => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  }, []);

  // Flipping a card counts as a light "seen" signal — nudge its weight down.
  const onReveal = useCallback(() => {
    if (current) recordAnswer(current.id, true);
  }, [current, recordAnswer]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Flashcards</Text>
        <Text style={styles.counter}>
          {filtered.length ? `${currentIndex + 1} / ${filtered.length}` : "0"}
        </Text>
      </View>

      <FlatList
        data={["All", ...CATEGORIES] as (Category | "All")[]}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
        renderItem={({ item }) => {
          const active = activeCategory === item;
          return (
            <TouchableOpacity
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => selectCategory(item)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: filtered.length
                ? `${((currentIndex + 1) / filtered.length) * 100}%`
                : "0%",
            },
          ]}
        />
      </View>

      <View style={styles.cardArea}>
        {current ? (
          <Flashcard
            question={current}
            ttsRate={settings.ttsRate}
            onReveal={onReveal}
          />
        ) : (
          <View style={styles.empty}>
            <Ionicons name="layers-outline" size={64} color="#c7d2fe" />
            <Text style={styles.emptyText}>No cards in this category</Text>
          </View>
        )}
      </View>

      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={goPrev}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={currentIndex === 0 ? "#d1d5db" : "#4f46e5"}
          />
          <Text
            style={[styles.navText, currentIndex === 0 && { color: "#d1d5db" }]}
          >
            Prev
          </Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navCenterText}>{current?.section ?? ""}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navBtn,
            currentIndex >= filtered.length - 1 && styles.navBtnDisabled,
          ]}
          onPress={goNext}
          disabled={currentIndex >= filtered.length - 1}
        >
          <Text
            style={[
              styles.navText,
              currentIndex >= filtered.length - 1 && { color: "#d1d5db" },
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="arrow-forward"
            size={22}
            color={currentIndex >= filtered.length - 1 ? "#d1d5db" : "#4f46e5"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9ff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#1a1f36" },
  counter: { fontSize: 14, fontWeight: "600", color: "#4f46e5" },
  pills: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  pillActive: { backgroundColor: "#4f46e5" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  pillTextActive: { color: "#fff" },
  progressTrack: {
    height: 4,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: { height: "100%", backgroundColor: "#4f46e5", borderRadius: 2 },
  cardArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", gap: 16 },
  emptyText: { fontSize: 16, color: "#94a3b8", fontWeight: "500" },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
  },
  navBtnDisabled: { backgroundColor: "#f1f5f9" },
  navText: { fontSize: 14, fontWeight: "600", color: "#4f46e5" },
  navCenter: { flex: 1, alignItems: "center" },
  navCenterText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
    textAlign: "center",
  },
});
