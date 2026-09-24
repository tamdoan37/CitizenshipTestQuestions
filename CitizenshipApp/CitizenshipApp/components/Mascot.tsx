import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Simple "Liberty" bird mascot placeholder — an emoji in a soft amber disc.
 * (Kept dependency-free; swap for an SVG/Lottie later.)
 */
export function Mascot({ size = 72 }: { size?: number }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>🦅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: "rgba(245,158,11,0.18)",
    borderWidth: 2,
    borderColor: "rgba(245,158,11,0.45)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
