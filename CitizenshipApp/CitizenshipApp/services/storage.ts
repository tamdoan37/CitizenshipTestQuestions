import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppSettings, CivicsData, QuestionTracker } from "@/types";
import { QUESTIONS } from "@/data/questions";
import { initialTracker } from "./srs";

// Re-export the pure SRS helpers so existing imports from "@/services/storage"
// keep working while the logic lives in one testable place.
export { applyAnswer } from "./srs";

const KEYS = {
  TRACKERS: "@citizenship/trackers",
  SETTINGS: "@citizenship/settings",
  CIVICS: "@citizenship/civics_data",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  homeState: "WI",
  notificationsEnabled: false,
  notificationTime: "09:00",
  ttsRate: 0.9,
};

/** Every question starts with a neutral weight of 1. */
export function buildInitialTrackers(): QuestionTracker[] {
  return QUESTIONS.map((q) => initialTracker(q.id));
}

export async function loadTrackers(): Promise<QuestionTracker[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TRACKERS);
    if (!raw) return buildInitialTrackers();
    const stored: QuestionTracker[] = JSON.parse(raw);
    // Reconcile against the canonical question set (handles added questions).
    const byId = new Map(stored.map((t) => [t.questionId, t]));
    return QUESTIONS.map((q) => byId.get(q.id) ?? initialTracker(q.id));
  } catch {
    return buildInitialTrackers();
  }
}

export async function saveTrackers(trackers: QuestionTracker[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TRACKERS, JSON.stringify(trackers));
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadCivicsData(): Promise<CivicsData | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CIVICS);
    if (!raw) return null;
    const data: CivicsData = JSON.parse(raw);
    if (Date.now() - new Date(data.lastUpdated).getTime() > 86_400_000) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveCivicsData(data: CivicsData): Promise<void> {
  await AsyncStorage.setItem(KEYS.CIVICS, JSON.stringify(data));
}
