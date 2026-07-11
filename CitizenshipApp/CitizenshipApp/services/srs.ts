import type { QuestionTracker } from "@/types";

/**
 * Spaced-repetition math for the question trackers.
 *
 * This module is intentionally free of any React Native / AsyncStorage
 * imports so it can be unit-tested in a plain Node environment.
 */

// A question is considered "mastered" at this consecutive-correct streak.
export const MASTERY_STREAK = 2;

// Weight bounds. Higher weight → surfaces more often in weighted draws.
export const MIN_WEIGHT = 0.25;
export const MAX_WEIGHT = 8;
export const BASE_WEIGHT = 1;

// Decay/growth factors applied on each answer.
const CORRECT_DECAY = 0.6;
const INCORRECT_GROWTH = 1.8;

export function initialTracker(questionId: number): QuestionTracker {
  return {
    questionId,
    correctStreak: 0,
    timesAnswered: 0,
    weight: BASE_WEIGHT,
    lastAttempted: "",
  };
}

/**
 * Recompute a tracker after an answer.
 * Correct   → streak++, weight decays toward MIN_WEIGHT.
 * Incorrect → streak resets to 0, weight climbs toward MAX_WEIGHT.
 *
 * @param now - ISO timestamp to stamp; injectable for deterministic tests.
 */
export function applyAnswer(
  tracker: QuestionTracker,
  wasCorrect: boolean,
  now: string = new Date().toISOString()
): QuestionTracker {
  const timesAnswered = tracker.timesAnswered + 1;

  if (wasCorrect) {
    return {
      ...tracker,
      timesAnswered,
      lastAttempted: now,
      correctStreak: tracker.correctStreak + 1,
      weight: Math.max(MIN_WEIGHT, tracker.weight * CORRECT_DECAY),
    };
  }

  return {
    ...tracker,
    timesAnswered,
    lastAttempted: now,
    correctStreak: 0,
    weight: Math.min(MAX_WEIGHT, tracker.weight * INCORRECT_GROWTH + 1),
  };
}

export function isMastered(tracker: QuestionTracker): boolean {
  return tracker.correctStreak >= MASTERY_STREAK;
}
