import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { useNotifications } from "@/hooks/useNotifications";

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

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const { scheduleDaily, cancelAll } = useNotifications();
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [notifTime, setNotifTime] = useState(settings.notificationTime);

  const currentStateName =
    US_STATES.find(([, code]) => code === settings.homeState)?.[0] ??
    settings.homeState;

  async function toggleNotifications(enabled: boolean) {
    await updateSettings({ notificationsEnabled: enabled });
    if (enabled) {
      const [h, m] = notifTime.split(":");
      await scheduleDaily(h, m);
    } else {
      await cancelAll();
    }
  }

  async function saveNotifTime() {
    if (!/^\d{2}:\d{2}$/.test(notifTime)) {
      Alert.alert("Invalid time", "Enter the time as HH:MM (24-hour).");
      return;
    }
    await updateSettings({ notificationTime: notifTime });
    if (settings.notificationsEnabled) {
      const [h, m] = notifTime.split(":");
      await scheduleDaily(h, m);
    }
    Alert.alert("Saved", "Daily reminder time updated.");
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* ── Home State ─────────────────────────────────── */}
        <SectionHeader icon="location" label="Home State" />
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowStatePicker((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={styles.row}>
            <View>
              <Text style={styles.cardLabel}>Selected State</Text>
              <Text style={styles.cardValue}>
                {currentStateName} ({settings.homeState})
              </Text>
            </View>
            <Ionicons
              name={showStatePicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#4f46e5"
            />
          </View>
        </TouchableOpacity>

        {showStatePicker && (
          <View style={styles.stateGrid}>
            {US_STATES.map(([name, code]) => {
              const active = settings.homeState === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.stateChip, active && styles.stateChipActive]}
                  onPress={async () => {
                    await updateSettings({ homeState: code });
                    setShowStatePicker(false);
                  }}
                  accessibilityLabel={name}
                >
                  <Text style={[styles.stateChipText, active && styles.stateChipTextActive]}>
                    {code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Daily Reminder ─────────────────────────────── */}
        <SectionHeader icon="notifications" label="Daily Reminder" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Flashcard of the Day</Text>
              <Text style={styles.cardSub}>
                A civics question delivered once a day.
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: "#4f46e5", false: "#e2e8f0" }}
              thumbColor="#fff"
            />
          </View>
          {settings.notificationsEnabled && (
            <View style={styles.timeRow}>
              <Text style={styles.cardLabel}>Reminder Time (HH:MM)</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  value={notifTime}
                  onChangeText={setNotifTime}
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  placeholder="09:00"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={saveNotifTime}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── Listening / TTS ────────────────────────────── */}
        <SectionHeader icon="volume-high" label="Listening Practice" />
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Text-to-Speech Rate</Text>
          <Text style={styles.cardSub}>Current: {settings.ttsRate.toFixed(1)}×</Text>
          <View style={styles.rateRow}>
            {[0.7, 0.9, 1.0, 1.2].map((rate) => {
              const active = settings.ttsRate === rate;
              return (
                <TouchableOpacity
                  key={rate}
                  style={[styles.rateBtn, active && styles.rateBtnActive]}
                  onPress={() => updateSettings({ ttsRate: rate })}
                >
                  <Text style={[styles.rateBtnText, active && styles.rateBtnTextActive]}>
                    {rate}×
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Support ────────────────────────────────────── */}
        <SectionHeader icon="heart" label="Support" />
        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => router.push("/tip-jar")}
          activeOpacity={0.85}
        >
          <View style={styles.supportIcon}>
            <Ionicons name="heart" size={22} color="#e11d48" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Support this app</Text>
            <Text style={styles.supportSub}>
              Optional tips keep it free and ad-free for all.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* ── About ──────────────────────────────────────── */}
        <View style={styles.about}>
          <Text style={styles.aboutText}>US Citizenship Test · v1.0.0</Text>
          <Text style={styles.aboutText}>
            2025 USCIS Civics Test · 128 Questions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color="#4f46e5" />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9ff" },
  container: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: "800", color: "#1a1f36", marginBottom: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { fontSize: 15, fontWeight: "600", color: "#1a1f36" },
  cardValue: { fontSize: 14, color: "#4f46e5", fontWeight: "700", marginTop: 2 },
  cardSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  stateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  stateChipActive: { backgroundColor: "#4f46e5" },
  stateChipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  stateChipTextActive: { color: "#fff" },
  timeRow: { marginTop: 14 },
  timeInputRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1a1f36",
  },
  saveBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  rateRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  rateBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  rateBtnActive: { backgroundColor: "#4f46e5" },
  rateBtnText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  rateBtnTextActive: { color: "#fff" },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: { fontSize: 15, fontWeight: "700", color: "#1a1f36" },
  supportSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  about: { alignItems: "center", marginTop: 28, gap: 4 },
  aboutText: { fontSize: 12, color: "#94a3b8" },
});
