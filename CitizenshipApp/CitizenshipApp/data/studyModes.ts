import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface StudyMode {
  /** Stable key persisted in settings.favoriteModes — never change these. */
  key: string;
  title: string;
  desc: string;
  icon: IconName;
  color: string;
  href: Href;
  group: "study" | "reference";
}

/** Every pickable study mode, shared by the Study tab and the Dashboard. */
export const STUDY_MODES: StudyMode[] = [
  { key: "flashcards", title: "Flashcards", desc: "Flip through all 128 questions", icon: "layers", color: "#2563eb", href: "/flashcards", group: "study" },
  { key: "quiz", title: "Quick Quiz", desc: "20 weighted questions, 12 to pass", icon: "checkmark-circle", color: "#f59e0b", href: "/quiz", group: "study" },
  { key: "mock-interview", title: "Mock Interview", desc: "Simulate the real USCIS interview", icon: "people", color: "#ef4444", href: "/mock-interview", group: "study" },
  { key: "oral-practice", title: "Oral Practice", desc: "Hear it, answer aloud, self-check", icon: "mic", color: "#22c55e", href: "/oral-practice", group: "study" },
  { key: "listen", title: "Listen Mode", desc: "Hands-free audio of Q & A", icon: "headset", color: "#06b6d4", href: "/listen", group: "study" },
  { key: "read-write", title: "Read & Write", desc: "Practice the English portion", icon: "create", color: "#a855f7", href: "/read-write", group: "study" },
  { key: "review", title: "Quick Review", desc: "Browse answers by category", icon: "list", color: "#2563eb", href: "/review", group: "reference" },
  { key: "vocab", title: "Vocabulary Drill", desc: "Key civics terms & meanings", icon: "book", color: "#a855f7", href: "/vocab", group: "reference" },
];

export const STUDY_MODE_BY_KEY: Record<string, StudyMode> = Object.fromEntries(
  STUDY_MODES.map((m) => [m.key, m])
);

/** Default Quick Study shortcuts when the user hasn't picked any favorites. */
export const DEFAULT_QUICK_KEYS = ["flashcards", "quiz"];
