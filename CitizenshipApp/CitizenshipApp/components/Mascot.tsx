import React from "react";
import { Image, StyleSheet, View } from "react-native";

/**
 * "Liberty" mascot — the Statue of Liberty artwork (same source as the app
 * background), cropped to the torch + crown + face and shown in a soft amber
 * ring so it reads as a friendly badge.
 */
export function Mascot({ size = 72 }: { size?: number }) {
  const radius = size / 2;
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: radius, borderWidth: Math.max(2, size * 0.03) },
      ]}
    >
      <Image
        source={require("../assets/liberty-mascot.png")}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
        accessibilityLabel="Statue of Liberty"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: "rgba(15,23,42,0.9)",
    borderColor: "rgba(245,158,11,0.75)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
});
