import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/** Shared back header for the study-mode screens. */
export function ModeHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/study"))}
        hitSlop={12}
      >
        <Ionicons name="arrow-back" size={24} color="#4f46e5" />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right ?? <View style={{ width: 24 }} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#1a1f36" },
  right: { minWidth: 24, alignItems: "flex-end" },
});
