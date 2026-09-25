import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type {
  AppSettings,
  CivicsData,
  OfficialsOverride,
  Question,
  QuestionTracker,
  QuizHistoryEntry,
  QuizResult,
} from "@/types";
import { fetchCivicsData } from "@/services/api";
import { speech } from "@/services/speech";
import {
  DEFAULT_SETTINGS,
  applyAnswer,
  buildInitialTrackers,
  loadCivicsData,
  loadOfficialsOverride,
  loadPreferredAnswers,
  loadQuizHistory,
  loadSettings,
  loadTrackers,
  saveOfficialsOverride,
  savePreferredAnswers,
  saveQuizHistory,
  saveSettings,
  saveTrackers,
  clearAllData,
} from "@/services/storage";
import { QUESTIONS, patchDynamicAnswers } from "@/data/questions";

/** Merge non-empty override fields over fetched/cached civics data. */
function applyOverride(data: CivicsData, override: OfficialsOverride): CivicsData {
  const merged = { ...data };
  const FEDERAL = ["president", "vicePresident", "speakerOfHouse", "chiefJustice", "presidentParty"] as const;
  for (const k of FEDERAL) {
    const v = override[k];
    if (typeof v === "string" && v.trim()) merged[k] = v.trim();
  }
  // Governor is state-specific: only apply it when it was entered for the
  // state currently being shown, so it can't leak onto another state.
  if (override.governor && override.governor.trim() && override.governorState === data.state) {
    merged.governor = override.governor.trim();
  }
  return merged;
}

interface AppState {
  hydrated: boolean;
  settings: AppSettings;
  trackers: QuestionTracker[];
  civicsData: CivicsData | null;
  questions: Question[]; // patched with live official names
  isLoadingCivics: boolean;
  civicsError: string | null;
  preferredAnswers: Record<number, string[]>;
  quizHistory: QuizHistoryEntry[];
  officialsOverride: OfficialsOverride;
}

type Action =
  | { type: "HYDRATE"; settings: AppSettings; trackers: QuestionTracker[];
      preferredAnswers: Record<number, string[]>; quizHistory: QuizHistoryEntry[];
      officialsOverride: OfficialsOverride }
  | { type: "SET_SETTINGS"; settings: AppSettings }
  | { type: "SET_TRACKERS"; trackers: QuestionTracker[] }
  | { type: "SET_CIVICS"; data: CivicsData; questions: Question[] }
  | { type: "SET_CIVICS_LOADING"; value: boolean }
  | { type: "SET_CIVICS_ERROR"; error: string | null }
  | { type: "SET_PREFERRED"; preferredAnswers: Record<number, string[]> }
  | { type: "SET_HISTORY"; quizHistory: QuizHistoryEntry[] }
  | { type: "SET_OVERRIDE"; officialsOverride: OfficialsOverride };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        hydrated: true,
        settings: action.settings,
        trackers: action.trackers,
        preferredAnswers: action.preferredAnswers,
        quizHistory: action.quizHistory,
        officialsOverride: action.officialsOverride,
      };
    case "SET_SETTINGS":
      return { ...state, settings: action.settings };
    case "SET_TRACKERS":
      return { ...state, trackers: action.trackers };
    case "SET_CIVICS":
      return {
        ...state,
        civicsData: action.data,
        questions: action.questions,
        isLoadingCivics: false,
        civicsError: null,
      };
    case "SET_CIVICS_LOADING":
      return { ...state, isLoadingCivics: action.value };
    case "SET_CIVICS_ERROR":
      return { ...state, civicsError: action.error, isLoadingCivics: false };
    case "SET_PREFERRED":
      return { ...state, preferredAnswers: action.preferredAnswers };
    case "SET_HISTORY":
      return { ...state, quizHistory: action.quizHistory };
    case "SET_OVERRIDE":
      return { ...state, officialsOverride: action.officialsOverride };
    default:
      return state;
  }
}

const initialState: AppState = {
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  trackers: buildInitialTrackers(),
  civicsData: null,
  questions: QUESTIONS,
  isLoadingCivics: false,
  civicsError: null,
  preferredAnswers: {},
  quizHistory: [],
  officialsOverride: {},
};

interface AppContextValue extends AppState {
  /** Map of questionId → live weight, for weighted quiz sampling. */
  weightById: Record<number, number>;
  /** Record a single answer and persist the updated tracker. */
  recordAnswer: (questionId: number, wasCorrect: boolean) => Promise<void>;
  /** Record a batch of answers (e.g. a finished quiz) in one write. */
  recordAnswers: (
    results: Array<{ questionId: number; wasCorrect: boolean }>
  ) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  refreshCivicsData: (force?: boolean) => Promise<void>;
  /** Pin/unpin a preferred (easiest) answer for a question. */
  togglePreferredAnswer: (questionId: number, answer: string) => Promise<void>;
  /** Record a finished quiz into history, including missed questions for review. */
  recordQuizResult: (
    result: QuizResult,
    userAnswers?: Record<number, string>
  ) => Promise<void>;
  clearQuizHistory: () => Promise<void>;
  /** Pin/unpin a study mode as one of the user's favorites. */
  toggleFavoriteMode: (key: string) => Promise<void>;
  /** Manually override official names; applied over fetched data immediately. */
  updateOfficials: (patch: OfficialsOverride) => Promise<void>;
  /** Wipe all saved data and return the app to a fresh-install state. */
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Hydrate persisted state on mount ────────────────────────────────
  useEffect(() => {
    (async () => {
      const [settings, trackers, cachedCivics, preferredAnswers, quizHistory, officialsOverride] =
        await Promise.all([
          loadSettings(),
          loadTrackers(),
          loadCivicsData(),
          loadPreferredAnswers(),
          loadQuizHistory(),
          loadOfficialsOverride(),
        ]);
      dispatch({ type: "HYDRATE", settings, trackers, preferredAnswers, quizHistory, officialsOverride });
      if (cachedCivics) {
        const merged = applyOverride(cachedCivics, officialsOverride);
        dispatch({
          type: "SET_CIVICS",
          data: merged,
          questions: patchDynamicAnswers(QUESTIONS, merged),
        });
      }
    })();
  }, []);

  // Keep the TTS voice preference in sync with settings for every speaker.
  useEffect(() => {
    speech.setVoiceGender(state.settings.voiceGender);
  }, [state.settings.voiceGender]);

  // Read the override via a ref inside refreshCivicsData so that editing the
  // override doesn't change the callback's identity (which would otherwise
  // re-trigger the auto-fetch effect and flash the loading state).
  const overrideRef = useRef(state.officialsOverride);
  useEffect(() => {
    overrideRef.current = state.officialsOverride;
  }, [state.officialsOverride]);

  // ── Live civics data (President, Senators, Governor, …) ─────────────
  const refreshCivicsData = useCallback(
    async (force = false) => {
      dispatch({ type: "SET_CIVICS_LOADING", value: true });
      try {
        const fetched = await fetchCivicsData(state.settings.homeState, force);
        const data = applyOverride(fetched, overrideRef.current);
        dispatch({
          type: "SET_CIVICS",
          data,
          questions: patchDynamicAnswers(QUESTIONS, data),
        });
      } catch {
        dispatch({
          type: "SET_CIVICS_ERROR",
          error: "Could not load live officials data.",
        });
      }
    },
    [state.settings.homeState]
  );

  // Fetch whenever the home state changes (and once after hydration).
  useEffect(() => {
    if (state.hydrated) refreshCivicsData();
  }, [state.hydrated, state.settings.homeState, refreshCivicsData]);

  // ── Answer tracking ─────────────────────────────────────────────────
  const recordAnswer = useCallback(
    async (questionId: number, wasCorrect: boolean) => {
      const next = state.trackers.map((t) =>
        t.questionId === questionId ? applyAnswer(t, wasCorrect) : t
      );
      dispatch({ type: "SET_TRACKERS", trackers: next });
      await saveTrackers(next);
    },
    [state.trackers]
  );

  const recordAnswers = useCallback(
    async (results: Array<{ questionId: number; wasCorrect: boolean }>) => {
      const resultMap = new Map(results.map((r) => [r.questionId, r.wasCorrect]));
      const next = state.trackers.map((t) =>
        resultMap.has(t.questionId)
          ? applyAnswer(t, resultMap.get(t.questionId)!)
          : t
      );
      dispatch({ type: "SET_TRACKERS", trackers: next });
      await saveTrackers(next);
    },
    [state.trackers]
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const updated = { ...state.settings, ...patch };
      dispatch({ type: "SET_SETTINGS", settings: updated });
      await saveSettings(updated);
    },
    [state.settings]
  );

  // ── Preferred answers ───────────────────────────────────────────────
  const togglePreferredAnswer = useCallback(
    async (questionId: number, answer: string) => {
      const current = state.preferredAnswers[questionId] ?? [];
      const nextArr = current.includes(answer)
        ? current.filter((a) => a !== answer)
        : [...current, answer];
      const next = { ...state.preferredAnswers };
      if (nextArr.length) next[questionId] = nextArr;
      else delete next[questionId];
      dispatch({ type: "SET_PREFERRED", preferredAnswers: next });
      await savePreferredAnswers(next);
    },
    [state.preferredAnswers]
  );

  // ── Quiz history ────────────────────────────────────────────────────
  const recordQuizResult = useCallback(
    async (result: QuizResult, userAnswers?: Record<number, string>) => {
      const entry: QuizHistoryEntry = {
        date: new Date().toISOString(),
        score: result.score,
        total: result.total,
        passed: result.passed,
        durationSeconds: Math.round(result.duration / 1000),
        missed: result.missedQuestions.map((q) => ({
          id: q.id,
          number: q.number,
          category: q.category,
          text: q.text,
          correct: q.answers[0] ?? "",
          your: userAnswers?.[q.id] ?? "",
        })),
      };
      const next = [entry, ...state.quizHistory].slice(0, 100);
      dispatch({ type: "SET_HISTORY", quizHistory: next });
      await saveQuizHistory(next);
    },
    [state.quizHistory]
  );

  const clearQuizHistory = useCallback(async () => {
    dispatch({ type: "SET_HISTORY", quizHistory: [] });
    await saveQuizHistory([]);
  }, []);

  // ── Favorite study modes ────────────────────────────────────────────
  const toggleFavoriteMode = useCallback(
    async (key: string) => {
      const current = state.settings.favoriteModes ?? [];
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      const updated = { ...state.settings, favoriteModes: next };
      dispatch({ type: "SET_SETTINGS", settings: updated });
      await saveSettings(updated);
    },
    [state.settings]
  );

  // ── Officials override ──────────────────────────────────────────────
  const updateOfficials = useCallback(
    async (patch: OfficialsOverride) => {
      const next = { ...state.officialsOverride, ...patch };
      dispatch({ type: "SET_OVERRIDE", officialsOverride: next });
      await saveOfficialsOverride(next);
      if (state.civicsData) {
        const merged = applyOverride(state.civicsData, next);
        dispatch({
          type: "SET_CIVICS",
          data: merged,
          questions: patchDynamicAnswers(QUESTIONS, merged),
        });
      }
    },
    [state.officialsOverride, state.civicsData]
  );

  // ── Reset everything to a fresh install ─────────────────────────────
  const resetApp = useCallback(async () => {
    await clearAllData();
    dispatch({ type: "SET_SETTINGS", settings: DEFAULT_SETTINGS });
    dispatch({ type: "SET_TRACKERS", trackers: buildInitialTrackers() });
    dispatch({ type: "SET_PREFERRED", preferredAnswers: {} });
    dispatch({ type: "SET_HISTORY", quizHistory: [] });
    dispatch({ type: "SET_OVERRIDE", officialsOverride: {} });
  }, []);

  // ── Derived: weight lookup for the quiz sampler ─────────────────────
  const weightById = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of state.trackers) map[t.questionId] = t.weight;
    return map;
  }, [state.trackers]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      weightById,
      recordAnswer,
      recordAnswers,
      updateSettings,
      refreshCivicsData,
      togglePreferredAnswer,
      recordQuizResult,
      clearQuizHistory,
      toggleFavoriteMode,
      updateOfficials,
      resetApp,
    }),
    [
      state,
      weightById,
      recordAnswer,
      recordAnswers,
      updateSettings,
      refreshCivicsData,
      togglePreferredAnswer,
      recordQuizResult,
      clearQuizHistory,
      toggleFavoriteMode,
      updateOfficials,
      resetApp,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside an AppProvider");
  return ctx;
}
