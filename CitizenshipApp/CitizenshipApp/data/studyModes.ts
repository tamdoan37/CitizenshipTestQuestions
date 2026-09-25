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
  /** "quick" = Dashboard Quick Study only (not listed on the Study tab). */
  group: "quick" | "practice" | "reference";
}

/** Every pickable study mode, shared by the Study tab and the Dashboard. */
export const STUDY_MODES: StudyMode[] = [
  // Quick Study lives on the Dashboard; these are not shown on the Study tab.
  { key: "flashcards", title: "Flashcards", desc: "Flip through all 128 questions", icon: "layers", color: "#2563eb", href: "/flashcards", group: "quick" },
  { key: "quiz", title: "Quick Quiz", desc: "20 weighted questions, 12 to pass", icon: "checkmark-circle", color: "#16a34a", href: "/quiz", group: "quick" },
  // Practice
  { key: "mock-interview", title: "Mock Interview", desc: "Simulate the real USCIS interview", icon: "people", color: "#ef4444", href: "/mock-interview", group: "practice" },
  { key: "oral-practice", title: "Oral Practice", desc: "Hear it, answer aloud, self-check", icon: "mic", color: "#22c55e", href: "/oral-practice", group: "practice" },
  { key: "listen", title: "Listen Mode", desc: "Hands-free audio of Q & A", icon: "headset", color: "#06b6d4", href: "/listen", group: "practice" },
  { key: "read-write", title: "Read & Write", desc: "Practice the English portion", icon: "create", color: "#a855f7", href: "/read-write", group: "practice" },
  // Reference
  { key: "review", title: "Quick Review", desc: "Browse answers by category", icon: "list", color: "#2563eb", href: "/review", group: "reference" },
  { key: "vocab", title: "Vocabulary Drill", desc: "Key civics terms & meanings", icon: "book", color: "#a855f7", href: "/vocab", group: "reference" },
  { key: "weak-spots", title: "Weak Spots", desc: "Focus on the questions you miss", icon: "star", color: "#f59e0b", href: "/weak-spots", group: "reference" },
];

export const STUDY_MODE_BY_KEY: Record<string, StudyMode> = Object.fromEntries(
  STUDY_MODES.map((m) => [m.key, m])
);

/** Default Quick Study shortcuts when the user hasn't picked any favorites. */
export const DEFAULT_QUICK_KEYS = ["flashcards", "quiz"];
