import { Injectable } from '@angular/core';
import { Question } from './civics-api.service';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuizResult {
  totalQuestions:  number;
  correctCount:    number;
  isPassed:        boolean;
  scorePercent:    number;
  duration:        number; // seconds
  answersById:     Record<string, boolean>; // questionId → wasCorrect
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const PASS_THRESHOLD  = 12;  // Must answer ≥ 12 of 20 correctly (USCIS standard)
export const QUIZ_SIZE       = 20;

@Injectable({ providedIn: 'root' })
export class ScoringService {

  /** Lowercase, trim, collapse internal spaces, strip trailing punctuation. */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?;:'"]+$/, '');
  }

  /**
   * Check if a user's answer matches any of the question's acceptable answers.
   * Strips parenthetical hints from canonical answers before comparing, so
   * "(Thomas) Jefferson" matches both "Jefferson" and "Thomas Jefferson".
   */
  isAnswerCorrect(question: Question, userAnswer: string): boolean {
    const normalizedUser = this.normalize(userAnswer);
    if (!normalizedUser) return false;

    return question.fixedAnswers.some(canonical => {
      // Remove parenthetical hints: "(Thomas) Jefferson" → "Jefferson"
      const stripped = this.normalize(canonical.replace(/\(.*?\)\s*/g, ''));
      // Also try with the parenthetical content included without parens
      const withHint = this.normalize(canonical.replace(/[()]/g, ''));
      return normalizedUser === stripped || normalizedUser === withHint;
    });
  }

  /**
   * Score a completed quiz.
   * @param questions  The ordered list of questions that were asked.
   * @param answersById  Map of questionId → user's raw answer string.
   * @param duration  Elapsed seconds.
   */
  scoreQuiz(
    questions: Question[],
    answersById: Record<string, string>,
    duration: number
  ): QuizResult {
    let correctCount = 0;
    const resultMap: Record<string, boolean> = {};

    for (const q of questions) {
      const userAnswer = answersById[q.questionId] ?? '';
      const correct    = this.isAnswerCorrect(q, userAnswer);
      resultMap[q.questionId] = correct;
      if (correct) correctCount++;
    }

    return {
      totalQuestions: questions.length,
      correctCount,
      isPassed:       correctCount >= PASS_THRESHOLD,
      scorePercent:   Math.round((correctCount / questions.length) * 100),
      duration,
      answersById:    resultMap,
    };
  }

  /**
   * Levenshtein edit distance — used for fuzzy oral answer scoring.
   * Returns a distance in [0, maxLen]; divide by maxLen for a similarity ratio.
   */
  editDistance(a: string, b: string): number {
    const na = this.normalize(a);
    const nb = this.normalize(b);
    if (na === nb) return 0;

    const m = na.length;
    const n = nb.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = na[i - 1] === nb[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  /** Similarity in [0, 1] using edit distance. */
  similarity(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - this.editDistance(a, b) / maxLen;
  }
}
