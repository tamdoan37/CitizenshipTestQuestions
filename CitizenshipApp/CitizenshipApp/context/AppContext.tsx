import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type {
  AppSettings,
  CivicsData,
  Question,
  QuestionTracker,
} from "@/types";
import { fetchCivicsData } from "@/services/api";
import {
  DEFAULT_SETTINGS,
  applyAnswer,
  buildInitialTrackers,
  loadCivicsData,
  loadSettings,
  loadTrackers,
  saveSettings,
  saveTrackers,
} from "@/services/storage";
import { QUESTIONS, patchDynamicAnswers } from "@/data/questions";

interface AppState {
  hydrated: boolean;
  settings: AppSettings;
  trackers: QuestionTracker[];
  civicsData: CivicsData | null;
  questions: Question[]; // patched with live official names
  isLoadingCivics: boolean;
  civicsError: string | null;
}

type Action =
  | { type: "HYDRATE"; settings: AppSettings; trackers: QuestionTracker[] }
  | { type: "SET_SETTINGS"; settings: AppSettings }
  | { type: "SET_TRACKERS"; trackers: QuestionTracker[] }
  | { type: "SET_CIVICS"; data: CivicsData; questions: Question[] }
  | { type: "SET_CIVICS_LOADING"; value: boolean }
  | { type: "SET_CIVICS_ERROR"; error: string | null };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        hydrated: true,
        settings: action.settings,
        trackers: action.trackers,
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Hydrate persisted state on mount ────────────────────────────────
  useEffect(() => {
    (async () => {
      const [settings, trackers, cachedCivics] = await Promise.all([
        loadSettings(),
        loadTrackers(),
        loadCivicsData(),
      ]);
      dispatch({ type: "HYDRATE", settings, trackers });
      if (cachedCivics) {
        dispatch({
          type: "SET_CIVICS",
          data: cachedCivics,
          questions: patchDynamicAnswers(QUESTIONS, cachedCivics),
        });
      }
    })();
  }, []);

  // ── Live civics data (President, Senators, Governor, …) ─────────────
  const refreshCivicsData = useCallback(
    async (force = false) => {
      dispatch({ type: "SET_CIVICS_LOADING", value: true });
      try {
        const data = await fetchCivicsData(state.settings.homeState, force);
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
    }),
    [
      state,
      weightById,
      recordAnswer,
      recordAnswers,
      updateSettings,
      refreshCivicsData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside an AppProvider");
  return ctx;
}
