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
      blurRadius={6}
      style={[styles.fill, style]}
    >
      {/* Readability veil — keeps content crisp over the blurred photo. */}
      <View style={styles.veil} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Deep navy base so the image reads even before it decodes / on letterbox edges.
  fill: { flex: 1, backgroundColor: "#1e1b4b" },
  veil: {
    ...StyleSheet.absoluteFillObject,
    // Strong enough that dark text and faded labels floating over the backdrop
    // stay comfortably readable, while the blurred statue still reads as a soft
    // patriotic wash behind the white content cards.
    backgroundColor: "rgba(245,247,252,0.62)",
  },
});
