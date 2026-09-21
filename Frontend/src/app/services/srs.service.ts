import { Injectable } from '@angular/core';
import { Question } from './civics-api.service';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuestionTracker {
  questionId: string;
  weight: number;         // [MIN_WEIGHT .. MAX_WEIGHT]; higher = shown more often
  correctStreak: number;  // consecutive correct answers
  totalAnswers: number;
  totalCorrect: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const MASTERY_STREAK = 2;
export const MIN_WEIGHT     = 0.25;
export const MAX_WEIGHT     = 8.0;
export const BASE_WEIGHT    = 1.0;
export const STARRED_WEIGHT = 1.5;  // Higher starting weight for starred questions

@Injectable({ providedIn: 'root' })
export class SrsService {

  /** Create a fresh tracker for a question. */
  initialTracker(questionId: string, isStarred = false): QuestionTracker {
    return {
      questionId,
      weight:        isStarred ? STARRED_WEIGHT : BASE_WEIGHT,
      correctStreak: 0,
      totalAnswers:  0,
      totalCorrect:  0,
    };
  }

  /**
   * Apply an answer result and return an updated tracker (immutable).
   * Correct: weight × 0.6  (floor MIN_WEIGHT), streak++
   * Wrong:   weight × 1.8 + 1.0  (cap MAX_WEIGHT), streak → 0
   */
  applyAnswer(tracker: QuestionTracker, wasCorrect: boolean): QuestionTracker {
    const weight = wasCorrect
      ? Math.max(MIN_WEIGHT, tracker.weight * 0.6)
      : Math.min(MAX_WEIGHT, tracker.weight * 1.8 + 1.0);

    return {
      ...tracker,
      weight,
      correctStreak: wasCorrect ? tracker.correctStreak + 1 : 0,
      totalAnswers:  tracker.totalAnswers + 1,
      totalCorrect:  tracker.totalCorrect + (wasCorrect ? 1 : 0),
    };
  }

  /** A question is mastered once it has been answered correctly MASTERY_STREAK times in a row. */
  isMastered(tracker: QuestionTracker): boolean {
    return tracker.correctStreak >= MASTERY_STREAK;
  }

  /**
   * Weighted random selection without replacement.
   * Probability of selecting each question is proportional to its weight.
   */
  getWeightedQuestions(
    questions: Question[],
    trackers: Record<string, QuestionTracker>,
    count: number
  ): Question[] {
    if (questions.length === 0) return [];

    const pool = questions.map(q => ({
      question: q,
      weight:   trackers[q.questionId]?.weight ?? BASE_WEIGHT,
    }));

    const selected: Question[] = [];

    while (selected.length < count && pool.length > 0) {
      const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      let rand = Math.random() * totalWeight;

      for (let i = 0; i < pool.length; i++) {
        rand -= pool[i].weight;
        if (rand <= 0) {
          selected.push(pool[i].question);
          pool.splice(i, 1);
          break;
        }
      }
    }

    return selected;
  }

  /** Upgrade a plain object (e.g. from localStorage) to a full tracker. */
  hydrateTracker(raw: Partial<QuestionTracker> & { questionId: string }): QuestionTracker {
    return {
      questionId:    raw.questionId,
      weight:        raw.weight        ?? BASE_WEIGHT,
      correctStreak: raw.correctStreak ?? 0,
      totalAnswers:  raw.totalAnswers  ?? 0,
      totalCorrect:  raw.totalCorrect  ?? 0,
    };
  }
}
