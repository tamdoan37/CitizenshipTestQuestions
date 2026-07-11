import type { Question, QuizResult } from "@/types";

/**
 * Answer-checking and quiz scoring.
 *
 * Pure functions only — no React Native imports — so the quiz logic can be
 * unit-tested directly.
 */

const PASS_THRESHOLD = 12;
const QUIZ_SIZE = 20;

/** Normalize an answer for tolerant comparison (case + surrounding space). */
export function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/** True if `userAnswer` matches any of the question's accepted answers. */
export function isAnswerCorrect(question: Question, userAnswer: string): boolean {
  if (!userAnswer) return false;
  const normalized = normalize(userAnswer);
  return question.answers.some((a) => normalize(a) === normalized);
}

/**
 * Score a completed quiz.
 * @param answersById - map of questionId → the answer the user picked.
 */
export function scoreQuiz(
  questions: Question[],
  answersById: Record<number, string>,
  duration: number,
  passThreshold: number = PASS_THRESHOLD
): QuizResult {
  const correct: Question[] = [];
  const missed: Question[] = [];

  for (const q of questions) {
    const picked = answersById[q.id] ?? "";
    (isAnswerCorrect(q, picked) ? correct : missed).push(q);
  }

  return {
    score: correct.length,
    total: questions.length,
    passed: correct.length >= passThreshold,
    correctQuestions: correct,
    missedQuestions: missed,
    duration,
  };
}

export { PASS_THRESHOLD, QUIZ_SIZE };
