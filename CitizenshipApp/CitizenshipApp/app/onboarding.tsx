import React, { useMemo, useState } from "react";
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
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { Mascot } from "@/components/Mascot";
import { useApp } from "@/context/AppContext";
import { US_STATES, stateName } from "@/data/states";
import officialsDoc from "@/data/officials.json";

const C = {
  navy: "#0f172a",
  navyCard: "#1e293b",
  blue: "#2563eb",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  text: "#f8fafc",
  sub: "#94a3b8",
};

const STATES = (officialsDoc as { states: Record<string, { governor: string; senators: string[]; capital: string }> }).states;

const GOALS = [
  { value: 5, label: "Light", desc: "Leisurely pace", edge: C.green, tag: "" },
  { value: 10, label: "Steady", desc: "A solid daily habit", edge: C.amber, tag: "RECOMMENDED" },
  { value: 20, label: "Intense", desc: "Your interview is close", edge: C.red, tag: "" },
];

export default function OnboardingScreen() {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [homeState, setHomeState] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return US_STATES;
    return US_STATES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [search]);

  const chosen = homeState ? STATES[homeState] : undefined;

  async function finish() {
    await updateSettings({
      userName: firstName.trim() || "Future Citizen",
      homeState: homeState || "WI",
      dailyGoal,
      hasOnboarded: true,
    });
    router.replace("/");
  }

  async function enableNotifications() {
    let granted = false;
    try {
      const res = await Notifications.requestPermissionsAsync();
      granted = res.granted || res.status === "granted";
    } catch {
      granted = false;
    }
    await updateSettings({ notificationsEnabled: granted });
    await finish();
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* progress dots */}
        <View style={styles.dots}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} style={[styles.dot, n <= step && styles.dotActive]} />
          ))}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          {/* ── Step 1: Where do you live ── */}
          {step === 1 && (
            <View style={styles.flex}>
              <View style={styles.headerBlock}>
                <Mascot />
                <Text style={styles.title}>Where do you live?</Text>
                <Text style={styles.subtitle}>
                  Liberty will quiz you on your governor, senators, and capital.
                </Text>
                <View style={styles.searchWrap}>
                  <Ionicons name="search" size={18} color={C.sub} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search your state"
                    placeholderTextColor={C.sub}
                    style={styles.searchInput}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {filtered.map((s) => {
                  const o = STATES[s.code];
                  return (
                    <TouchableOpacity
                      key={s.code}
                      style={styles.stateCard}
                      activeOpacity={0.85}
                      onPress={() => {
                        setHomeState(s.code);
                        setStep(2);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stateName}>{s.name}</Text>
                        <Text style={styles.stateMeta}>
                          Gov: {o?.governor ?? "—"} · Capital: {o?.capital ?? "—"}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={C.sub} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Step 2: Confirm what you'll learn ── */}
          {step === 2 && chosen && (
            <ScrollView contentContainerStyle={styles.centerScroll} showsVerticalScrollIndicator={false}>
              <Mascot />
              <Text style={styles.title}>{stateName(homeState)} it is! 🎉</Text>
              <Text style={styles.subtitle}>Here's what you'll be quizzed on:</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Governor" value={chosen.governor} />
                <InfoRow label="U.S. Senators" value={chosen.senators.join(", ")} />
                <InfoRow label="State Capital" value={chosen.capital} />
              </View>
              <PrimaryButton label="Continue" onPress={() => setStep(3)} />
              <TextLink label="Pick a different state" onPress={() => setStep(1)} />
            </ScrollView>
          )}

          {/* ── Step 3: Name + daily goal ── */}
          {step === 3 && (
            <ScrollView contentContainerStyle={styles.centerScroll} showsVerticalScrollIndicator={false}>
              <Mascot />
              <Text style={styles.title}>Last thing — what should I call you?</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your first name"
                placeholderTextColor={C.sub}
                style={styles.nameInput}
                autoCapitalize="words"
              />
              <Text style={[styles.subtitle, { marginTop: 20, marginBottom: 4 }]}>
                How many questions per day?
              </Text>
              {GOALS.map((g) => {
                const active = dailyGoal === g.value;
                return (
                  <TouchableOpacity
                    key={g.value}
                    activeOpacity={0.85}
                    onPress={() => setDailyGoal(g.value)}
                    style={[
                      styles.goalCard,
                      { borderLeftColor: g.edge },
                      active && styles.goalCardActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.goalTitle}>
                        {g.label} · {g.value}/day
                        {g.tag ? <Text style={styles.goalTag}>  {g.tag}</Text> : null}
                      </Text>
                      <Text style={styles.goalDesc}>{g.desc}</Text>
                    </View>
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={active ? C.blue : C.sub}
                    />
                  </TouchableOpacity>
                );
              })}
              <PrimaryButton label="Start studying" onPress={() => setStep(4)} />
            </ScrollView>
          )}

          {/* ── Step 4: Notifications ── */}
          {step === 4 && (
            <ScrollView contentContainerStyle={styles.centerScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.bell}>
                <Ionicons name="notifications" size={34} color={C.amber} />
              </View>
              <Text style={styles.title}>Stay on track</Text>
              <Text style={styles.subtitle}>A gentle daily nudge so you actually study.</Text>
              <View style={styles.infoCard}>
                <NudgeRow icon="time-outline" text="Daily study reminder at 8 PM" />
                <NudgeRow icon="flame-outline" text="Keep your study streak alive" />
                <NudgeRow icon="school-outline" text="Stay prepared for your interview" />
              </View>
              <PrimaryButton label="Enable Notifications" onPress={enableNotifications} />
              <TextLink label="Maybe later" onPress={finish} />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function NudgeRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.nudgeRow}>
      <Ionicons name={icon} size={20} color={C.amber} />
      <Text style={styles.nudgeText}>{text}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.textLink}>
      <Text style={styles.textLinkText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.navy },
  safe: { flex: 1 },
  flex: { flex: 1 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 14 },
  dot: { width: 26, height: 5, borderRadius: 3, backgroundColor: "#334155" },
  dotActive: { backgroundColor: C.blue },
  headerBlock: { paddingHorizontal: 24, paddingTop: 8, gap: 10 },
  centerScroll: { padding: 24, flexGrow: 1, justifyContent: "center", gap: 6 },
  title: {
    fontSize: 24, fontWeight: "800", color: C.text, textAlign: "center",
    marginTop: 12, letterSpacing: -0.02 * 24,
  },
  subtitle: { fontSize: 15, color: C.sub, textAlign: "center", lineHeight: 22 },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.navyCard, borderRadius: 16, paddingHorizontal: 14, marginTop: 8,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 12 },
  listContent: { padding: 16, gap: 10 },
  stateCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.navyCard, borderRadius: 16, padding: 16,
  },
  stateName: { fontSize: 16, fontWeight: "700", color: C.text },
  stateMeta: { fontSize: 13, color: C.sub, marginTop: 3 },
  infoCard: {
    width: "100%", backgroundColor: C.navyCard, borderRadius: 16, padding: 18, gap: 14, marginTop: 18,
  },
  infoRow: { gap: 2 },
  infoLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: C.amber },
  infoValue: { fontSize: 16, fontWeight: "600", color: C.text },
  nameInput: {
    width: "100%", backgroundColor: C.navyCard, borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 16, color: C.text, marginTop: 16,
  },
  goalCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.navyCard, borderRadius: 16, padding: 16, marginTop: 10, borderLeftWidth: 5,
  },
  goalCardActive: { backgroundColor: "#243045" },
  goalTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  goalTag: { fontSize: 11, fontWeight: "800", color: C.amber },
  goalDesc: { fontSize: 13, color: C.sub, marginTop: 3 },
  bell: {
    width: 72, height: 72, borderRadius: 36, alignSelf: "center",
    backgroundColor: "rgba(245,158,11,0.18)", borderWidth: 2, borderColor: "rgba(245,158,11,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  nudgeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  nudgeText: { fontSize: 15, color: C.text, flex: 1 },
  primaryBtn: {
    backgroundColor: C.blue, borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginTop: 24,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  textLink: { alignItems: "center", paddingVertical: 14 },
  textLinkText: { color: C.sub, fontWeight: "600", fontSize: 14 },
});
