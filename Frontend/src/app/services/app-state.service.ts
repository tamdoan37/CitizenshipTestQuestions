import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CivicsApiService, Question } from './civics-api.service';
import { QuestionTracker, SrsService, MASTERY_STREAK, BASE_WEIGHT } from './srs.service';
import { QuizResult } from './scoring.service';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AppSettings {
  homeState:   string;
  testVersion: string;
  ttsRate:     number;
}

/** A completed quiz, stored for the history view. */
export interface QuizHistoryEntry {
  date:            string; // ISO timestamp
  correctCount:    number;
  totalQuestions:  number;
  scorePercent:    number;
  isPassed:        boolean;
  durationSeconds: number;
}

const DEFAULT_USER_NAME = 'Future Citizen';

const LS_SETTINGS  = 'cf-settings';
const LS_TRACKERS  = 'cf-trackers';
const LS_USERNAME  = 'cf-username';
const LS_PREFERRED = 'cf-preferred-answers';
const LS_HISTORY   = 'cf-quiz-history';

function tryParse<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function tryWrite(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function hasStoredName(): boolean {
  try { return !!localStorage.getItem(LS_USERNAME); } catch { return false; }
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private api = inject(CivicsApiService);
  private srs = inject(SrsService);

  // ── Core signals ───────────────────────────────────────────────────────────

  hydrated        = signal<boolean>(false);
  isLoadingCivics = signal<boolean>(false);

  settings = signal<AppSettings>(
    tryParse<AppSettings>(LS_SETTINGS) ?? {
      homeState:   'WI',
      testVersion: '2025',
      ttsRate:     0.9,
    }
  );

  trackers = signal<Record<string, QuestionTracker>>(
    tryParse<Record<string, QuestionTracker>>(LS_TRACKERS) ?? {}
  );

  questions = signal<Question[]>([]);

  /** Personalization: the user's first name (from onboarding). */
  userName = signal<string>(
    (() => {
      try { return localStorage.getItem(LS_USERNAME) || DEFAULT_USER_NAME; }
      catch { return DEFAULT_USER_NAME; }
    })()
  );

  /** Per-question pinned "easiest" answers: questionId → chosen answers. */
  preferredAnswers = signal<Record<string, string[]>>(
    tryParse<Record<string, string[]>>(LS_PREFERRED) ?? {}
  );

  /** Completed quizzes, newest first. */
  quizHistory = signal<QuizHistoryEntry[]>(
    tryParse<QuizHistoryEntry[]>(LS_HISTORY) ?? []
  );

  /** True once the user has completed onboarding (name saved). */
  onboarded = signal<boolean>(hasStoredName());

  // ── Computed ───────────────────────────────────────────────────────────────

  /** Weight map by questionId for quick lookup. */
  weightById = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const t of Object.values(this.trackers())) {
      map[t.questionId] = t.weight;
    }
    return map;
  });

  masteredIds = computed<Set<string>>(() => {
    const ids = new Set<string>();
    for (const t of Object.values(this.trackers())) {
      if (t.correctStreak >= MASTERY_STREAK) ids.add(t.questionId);
    }
    return ids;
  });

  masteredCount = computed<number>(() => this.masteredIds().size);

  masteryPercent = computed<number>(() => {
    const total = this.questions().length;
    if (total === 0) return 0;
    return Math.round((this.masteredCount() / total) * 100);
  });

  attemptedIds = computed<Set<string>>(() => {
    const ids = new Set<string>();
    for (const [id, t] of Object.entries(this.trackers())) {
      if (t.totalAnswers > 0) ids.add(id);
    }
    return ids;
  });

  needReviewIds = computed<string[]>(() =>
    Object.values(this.trackers())
      .filter(t => t.weight > 1.5 && t.correctStreak === 0 && t.totalAnswers > 0)
      .sort((a, b) => b.weight - a.weight)
      .map(t => t.questionId)
  );

  coveragePercent = computed<number>(() => {
    const total = this.questions().length;
    if (total === 0) return 0;
    return Math.round((this.attemptedIds().size / total) * 100);
  });

  // ── Persistence effects ────────────────────────────────────────────────────

  constructor() {
    // Persist settings whenever they change
    effect(() => tryWrite(LS_SETTINGS, this.settings()));

    // Persist trackers whenever they change
    effect(() => tryWrite(LS_TRACKERS, this.trackers()));

    // Persist preferred answers and quiz history
    effect(() => tryWrite(LS_PREFERRED, this.preferredAnswers()));
    effect(() => tryWrite(LS_HISTORY, this.quizHistory()));

    // Reload questions when homeState or testVersion changes.
    // allowSignalWrites: the reload orchestrates async state (isLoadingCivics,
    // questions, hydrated) in response to a settings change — an intentional
    // signal-writing effect.
    effect(() => {
      const { homeState, testVersion } = this.settings();
      this.loadQuestions(homeState, testVersion);
    }, { allowSignalWrites: true });
  }

  // ── Methods ────────────────────────────────────────────────────────────────

  loadQuestions(stateCode: string, version: string): void {
    this.isLoadingCivics.set(true);
    this.api.getQuestions(stateCode, version).subscribe({
      next: (qs) => {
        this.questions.set(qs);
        this.hydrated.set(true);
        this.isLoadingCivics.set(false);
      },
      error: () => this.isLoadingCivics.set(false),
    });
  }

  updateSettings(patch: Partial<AppSettings>): void {
    this.settings.update(s => ({ ...s, ...patch }));
  }

  /** Re-fetch questions so freshly-updated official names are patched in. */
  refreshCivicsData(): void {
    const { homeState, testVersion } = this.settings();
    this.loadQuestions(homeState, testVersion);
  }

  /** Record an answer for a question and update SRS weight. */
  recordAnswer(questionId: string, wasCorrect: boolean): void {
    const question = this.questions().find(q => q.questionId === questionId);
    this.trackers.update(map => {
      const existing = map[questionId] ?? this.srs.initialTracker(questionId, question?.isStarredQuestion ?? false);
      return { ...map, [questionId]: this.srs.applyAnswer(existing, wasCorrect) };
    });
  }

  /** Record multiple answers at once (quiz result batch). */
  recordAnswers(results: Record<string, boolean>): void {
    this.trackers.update(map => {
      const updated = { ...map };
      for (const [questionId, wasCorrect] of Object.entries(results)) {
        const question = this.questions().find(q => q.questionId === questionId);
        const existing = updated[questionId] ?? this.srs.initialTracker(questionId, question?.isStarredQuestion ?? false);
        updated[questionId] = this.srs.applyAnswer(existing, wasCorrect);
      }
      return updated;
    });
  }

  getTrackerFor(questionId: string): QuestionTracker {
    return this.trackers()[questionId] ?? this.srs.initialTracker(questionId);
  }

  isMastered(questionId: string): boolean {
    return this.masteredIds().has(questionId);
  }

  /** Reset all SRS trackers (start fresh). */
  resetProgress(): void {
    this.trackers.set({});
  }

  // ── Onboarding / personalization ─────────────────────────────────────────────

  setUserName(name: string): void {
    const clean = name.trim() || DEFAULT_USER_NAME;
    this.userName.set(clean);
    try { localStorage.setItem(LS_USERNAME, clean); } catch { /* ignore */ }
    this.onboarded.set(true);
  }

  // ── Preferred answers ────────────────────────────────────────────────────────

  getPreferred(questionId: string): string[] {
    return this.preferredAnswers()[questionId] ?? [];
  }

  isPreferred(questionId: string, answer: string): boolean {
    return this.getPreferred(questionId).includes(answer);
  }

  /** Pin/unpin one answer as a user's preferred (easiest) answer. */
  togglePreferredAnswer(questionId: string, answer: string): void {
    this.preferredAnswers.update(map => {
      const current = map[questionId] ?? [];
      const next = current.includes(answer)
        ? current.filter(a => a !== answer)
        : [...current, answer];
      const updated = { ...map };
      if (next.length > 0) updated[questionId] = next;
      else delete updated[questionId];
      return updated;
    });
  }

  // ── Quiz history ─────────────────────────────────────────────────────────────

  /** Record a finished quiz into the history (newest first). */
  addQuizResult(result: QuizResult): void {
    const entry: QuizHistoryEntry = {
      date:            new Date().toISOString(),
      correctCount:    result.correctCount,
      totalQuestions:  result.totalQuestions,
      scorePercent:    result.scorePercent,
      isPassed:        result.isPassed,
      durationSeconds: result.duration,
    };
    this.quizHistory.update(list => [entry, ...list].slice(0, 100));
  }

  clearQuizHistory(): void {
    this.quizHistory.set([]);
  }
}
