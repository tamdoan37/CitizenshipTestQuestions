import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

interface Item {
  label: string;
  icon: IconName;
  href: Href;
}

const ITEMS: Item[] = [
  { label: "Dashboard", icon: "home", href: "/" },
  { label: "Flashcards", icon: "layers", href: "/flashcards" },
  { label: "Quiz", icon: "checkmark-circle", href: "/quiz" },
  { label: "Study", icon: "book", href: "/study" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

/**
 * Persistent bottom navigation for the pushed detail screens (study modes,
 * history, etc.) which live above the tab navigator and would otherwise have no
 * tab bar. Mirrors the real tab bar and jumps back to each section.
 */
export function BottomNav({ active }: { active?: string }) {
  return (
    <View style={styles.bar}>
      {ITEMS.map((it) => {
        const isActive = active === it.label;
        const color = isActive ? "#6366f1" : "#94a3b8";
        return (
          <TouchableOpacity
            key={it.label}
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => router.navigate(it.href)}
            accessibilityLabel={it.label}
          >
            <Ionicons name={it.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopColor: "#f1f5f9",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11, fontWeight: "600" },
});
