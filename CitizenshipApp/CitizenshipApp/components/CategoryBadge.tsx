import React from "react";
import { Text, View } from "react-native";
import type { Category } from "@/types";

const COLORS: Record<string, { bg: string; text: string }> = {
  "Principles of American Democracy": { bg: "#EEF2FF", text: "#4338CA" },
  "System of Government":            { bg: "#F0FDF4", text: "#15803D" },
  "Rights and Responsibilities":     { bg: "#FFF7ED", text: "#C2410C" },
  "Colonial Period and Independence": { bg: "#FDF4FF", text: "#7E22CE" },
  "1800s":                           { bg: "#FEF9C3", text: "#854D0E" },
  "Recent American History":         { bg: "#FFF1F2", text: "#BE123C" },
  "Geography":                       { bg: "#F0F9FF", text: "#0369A1" },
  "Symbols":                         { bg: "#ECFDF5", text: "#065F46" },
  "Holidays":                        { bg: "#FFF5F5", text: "#B91C1C" },
  "Path to Citizenship":             { bg: "#F5F3FF", text: "#6D28D9" },
};

interface Props {
  category: Category;
}

export function CategoryBadge({ category }: Props) {
  const { bg, text } = COLORS[category] ?? { bg: "#F3F4F6", text: "#374151" };
  return (
    <View
      style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}
    >
      <Text style={{ color: text, fontSize: 11, fontWeight: "600", letterSpacing: 0.3 }}>
        {category}
      </Text>
    </View>
  );
}
