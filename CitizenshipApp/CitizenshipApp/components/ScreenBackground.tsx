import React from "react";
import { ImageBackground, StyleSheet, View, type ViewStyle } from "react-native";

/**
 * App-wide screen background: the Statue of Liberty artwork, heavily blurred
 * with a translucent light veil on top so it adds a patriotic backdrop without
 * hurting the legibility of the white content cards.
 *
 * Wrap a screen's SafeAreaView in this and keep that view's background
 * "transparent" so the backdrop shows through.
 */
export function ScreenBackground({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <ImageBackground
      source={require("../assets/liberty-bg.png")}
      resizeMode="cover"
      blurRadius={18}
      style={[styles.fill, style]}
    >
      {/* Readability veil — keeps content crisp over the blurred photo. */}
      <View style={styles.veil} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#e7ecfb" },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(244,246,252,0.84)",
  },
});
