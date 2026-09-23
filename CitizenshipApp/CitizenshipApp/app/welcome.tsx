import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";

const US_STATES: Array<[name: string, code: string]> = [
  ["Alabama", "AL"], ["Alaska", "AK"], ["Arizona", "AZ"], ["Arkansas", "AR"],
  ["California", "CA"], ["Colorado", "CO"], ["Connecticut", "CT"], ["Delaware", "DE"],
  ["Florida", "FL"], ["Georgia", "GA"], ["Hawaii", "HI"], ["Idaho", "ID"],
  ["Illinois", "IL"], ["Indiana", "IN"], ["Iowa", "IA"], ["Kansas", "KS"],
  ["Kentucky", "KY"], ["Louisiana", "LA"], ["Maine", "ME"], ["Maryland", "MD"],
  ["Massachusetts", "MA"], ["Michigan", "MI"], ["Minnesota", "MN"], ["Mississippi", "MS"],
  ["Missouri", "MO"], ["Montana", "MT"], ["Nebraska", "NE"], ["Nevada", "NV"],
  ["New Hampshire", "NH"], ["New Jersey", "NJ"], ["New Mexico", "NM"], ["New York", "NY"],
  ["North Carolina", "NC"], ["North Dakota", "ND"], ["Ohio", "OH"], ["Oklahoma", "OK"],
  ["Oregon", "OR"], ["Pennsylvania", "PA"], ["Rhode Island", "RI"], ["South Carolina", "SC"],
  ["South Dakota", "SD"], ["Tennessee", "TN"], ["Texas", "TX"], ["Utah", "UT"],
  ["Vermont", "VT"], ["Virginia", "VA"], ["Washington", "WA"], ["West Virginia", "WV"],
  ["Wisconsin", "WI"], ["Wyoming", "WY"],
];

export default function WelcomeScreen() {
  const { updateSettings } = useApp();
  const [firstName, setFirstName] = useState("");
  const [homeState, setHomeState] = useState("WI");

  async function getStarted() {
    const name = firstName.trim();
    await updateSettings({
      userName: name || "Future Citizen",
      homeState,
      hasOnboarded: true,
    });
    router.replace("/");
  }

  async function skip() {
    await updateSettings({ hasOnboarded: true });
    router.replace("/");
  }

  return (
    <LinearGradient colors={["#312e81", "#4338ca", "#312e81"]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.flag}>🗽</Text>
            <Text style={styles.title}>Welcome to{"\n"}CitizenFlow</Text>
            <Text style={styles.subtitle}>
              Your free, ad-free path to the U.S. Citizenship Test. Let's personalize your study.
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Maria"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="done"
              />

              <Text style={[styles.label, { marginTop: 18 }]}>Your state</Text>
              <View style={styles.chips}>
                {US_STATES.map(([name, code]) => {
                  const active = homeState === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setHomeState(code)}
                      accessibilityLabel={name}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{code}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.cta} onPress={getStarted} activeOpacity={0.85}>
                <Text style={styles.ctaText}>Get Started →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skip} onPress={skip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40, flexGrow: 1, justifyContent: "center" },
  flag: { fontSize: 52, textAlign: "center", marginBottom: 8 },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: "#c7d2fe",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#6366f1",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e2e6f3",
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1f36",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  chipActive: { backgroundColor: "#4f46e5" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  chipTextActive: { color: "#fff" },
  cta: {
    marginTop: 22,
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  skip: { marginTop: 12, alignItems: "center" },
  skipText: { color: "#9ca3af", fontWeight: "600", fontSize: 13 },
});
