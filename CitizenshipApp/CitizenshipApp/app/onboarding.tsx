import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/components/ScreenBackground";
import { Mascot } from "@/components/Mascot";
import { useApp } from "@/context/AppContext";
import { US_STATES, stateName } from "@/data/states";
import officialsDoc from "@/data/officials.json";

const C = {
  text: "#0f172a",
  sub: "#64748b",
  blue: "#2563eb",
  amber: "#f59e0b",
  border: "#e2e8f0",
};

const STATES = (officialsDoc as {
  states: Record<string, { governor: string; senators: string[]; capital: string }>;
}).states;

export default function OnboardingScreen() {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [homeState, setHomeState] = useState("");

  async function finish() {
    await updateSettings({
      userName: firstName.trim() || "Future Citizen",
      homeState: homeState || "WI",
      hasOnboarded: true,
    });
    router.replace("/");
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* progress dots */}
        <View style={styles.dots}>
          {[1, 2].map((n) => (
            <View key={n} style={[styles.dot, n <= step && styles.dotActive]} />
          ))}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          {step === 1 ? (
            <View style={styles.flex}>
              <View style={styles.headerBlock}>
                <Text style={styles.title}>Welcome! Let's get set up</Text>
                <Text style={styles.label}>Your name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#94a3b8"
                  style={styles.nameInput}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
                <Text style={[styles.label, { marginTop: 18 }]}>Where do you live?</Text>
                <Text style={styles.hint}>
                  We'll show your state's governor, senators, and capital.
                </Text>
              </View>

              <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {US_STATES.map((s) => {
                  const o = STATES[s.code];
                  const active = homeState === s.code;
                  return (
                    <TouchableOpacity
                      key={s.code}
                      style={[styles.stateCard, active && styles.stateCardActive]}
                      activeOpacity={0.85}
                      onPress={() => setHomeState(s.code)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stateName}>{s.name}</Text>
                        <Text style={styles.stateMeta}>
                          Gov: {o?.governor ?? "—"} · Capital: {o?.capital ?? "—"}
                        </Text>
                      </View>
                      <Ionicons
                        name={active ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={active ? C.blue : "#cbd5e1"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.footer}>
                <PrimaryButton
                  label={homeState ? `Continue with ${stateName(homeState)}` : "Pick your state to continue"}
                  disabled={!homeState}
                  onPress={() => setStep(2)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.centerBlock}>
              <Mascot size={104} />
              <Text style={styles.goodLuckTitle}>
                Good luck on your journey to becoming a U.S. citizen!
              </Text>
              <Text style={styles.goodLuckSub}>
                You've got this{firstName.trim() ? `, ${firstName.trim()}` : ""}. Let's start
                studying.
              </Text>
              <View style={styles.footerCenter}>
                <PrimaryButton label="Start studying" onPress={finish} />
                <TouchableOpacity onPress={() => setStep(1)} style={styles.backLink}>
                  <Text style={styles.backLinkText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function PrimaryButton({
  label, onPress, disabled,
}: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && styles.primaryBtnDisabled,
        pressed && !disabled && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.primaryBtnText, disabled && styles.primaryBtnTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 14 },
  dot: { width: 26, height: 5, borderRadius: 3, backgroundColor: "#cbd5e1" },
  dotActive: { backgroundColor: C.blue },
  headerBlock: { paddingHorizontal: 24, paddingTop: 4 },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase", color: "#475569", marginBottom: 8 },
  hint: { fontSize: 13, color: C.sub, marginTop: 4, lineHeight: 18 },
  nameInput: {
    backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: C.text,
  },
  listContent: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 8 },
  stateCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 16, padding: 15, borderWidth: 1.5, borderColor: "transparent",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  stateCardActive: { borderColor: C.blue, backgroundColor: "#eff6ff" },
  stateName: { fontSize: 16, fontWeight: "700", color: C.text },
  stateMeta: { fontSize: 13, color: C.sub, marginTop: 3 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  centerBlock: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 14 },
  goodLuckTitle: {
    fontSize: 26, fontWeight: "800", color: C.text, textAlign: "center", lineHeight: 34, marginTop: 8,
  },
  goodLuckSub: { fontSize: 16, color: "#475569", textAlign: "center", lineHeight: 24 },
  footerCenter: { alignSelf: "stretch", marginTop: 12 },
  backLink: { alignItems: "center", paddingVertical: 12 },
  backLinkText: { color: C.sub, fontWeight: "600", fontSize: 14 },
  primaryBtn: { backgroundColor: C.blue, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  primaryBtnDisabled: { backgroundColor: "#e2e8f0" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  primaryBtnTextDisabled: { color: "#94a3b8" },
});
