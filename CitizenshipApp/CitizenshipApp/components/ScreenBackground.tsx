import React from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * App-wide screen background. A soft, indigo-tinted diagonal gradient so the
 * white content cards read as elevated instead of blending into a flat page.
 * Wrap a screen's SafeAreaView in this and set that view's background to
 * "transparent" so the gradient shows through.
 */
export function ScreenBackground({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={["#e7ecfb", "#f3f1fb", "#e6edff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
