import { TestBed } from '@angular/core/testing';
import {
  SrsService, QuestionTracker,
  MIN_WEIGHT, MAX_WEIGHT, BASE_WEIGHT, STARRED_WEIGHT, MASTERY_STREAK,
} from './srs.service';

function tracker(overrides: Partial<QuestionTracker> = {}): QuestionTracker {
  return {
    questionId: 'Q001',
    weight: BASE_WEIGHT,
    correctStreak: 0,
    totalAnswers: 0,
    totalCorrect: 0,
    ...overrides,
  };
}

describe('SrsService', () => {
  let srs: SrsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    srs = TestBed.inject(SrsService);
  });

  it('is created', () => {
    expect(srs).toBeTruthy();
  });

  describe('applyAnswer — correct', () => {
    it('increments streak to 1 and decays weight to 0.6', () => {
      const result = srs.applyAnswer(tracker({ weight: 1.0, correctStreak: 0 }), true);
      expect(result.correctStreak).toBe(1);
      expect(result.weight).toBeCloseTo(0.6, 5);
      expect(result.totalAnswers).toBe(1);
      expect(result.totalCorrect).toBe(1);
    });

    it('never lets weight drop below MIN_WEIGHT (0.25)', () => {
      // Start already at the floor: 0.25 * 0.6 = 0.15 → clamped up to 0.25.
      let t = tracker({ weight: MIN_WEIGHT, correctStreak: 5 });
      for (let i = 0; i < 10; i++) {
        t = srs.applyAnswer(t, true);
        expect(t.weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
      }
      expect(t.weight).toBe(MIN_WEIGHT);
    });

    it('does not mutate the input tracker (immutability)', () => {
      const input = tracker({ weight: 1.0 });
      const snapshot = { ...input };
      srs.applyAnswer(input, true);
      expect(input).toEqual(snapshot);
    });
  });

  describe('applyAnswer — incorrect', () => {
    it('resets streak to 0 and applies growth (weight * 1.8 + 1.0)', () => {
      const result = srs.applyAnswer(tracker({ weight: 1.0, correctStreak: 3 }), false);
      expect(result.correctStreak).toBe(0);
      expect(result.weight).toBeCloseTo(1.0 * 1.8 + 1.0, 5); // 2.8
      expect(result.totalAnswers).toBe(1);
      expect(result.totalCorrect).toBe(0);
    });

    it('caps weight at MAX_WEIGHT (8.0)', () => {
      // 5.0 * 1.8 + 1.0 = 10.0 → capped to 8.0
      const result = srs.applyAnswer(tracker({ weight: 5.0 }), false);
      expect(result.weight).toBe(MAX_WEIGHT);
    });
  });

  describe('mastery', () => {
    it('reports mastered once streak reaches MASTERY_STREAK', () => {
      expect(srs.isMastered(tracker({ correctStreak: MASTERY_STREAK - 1 }))).toBe(false);
      expect(srs.isMastered(tracker({ correctStreak: MASTERY_STREAK }))).toBe(true);
    });
  });

  describe('initialTracker', () => {
    it('uses BASE_WEIGHT for normal questions', () => {
      expect(srs.initialTracker('Q010').weight).toBe(BASE_WEIGHT);
    });
    it('uses STARRED_WEIGHT for starred questions', () => {
      expect(srs.initialTracker('Q010', true).weight).toBe(STARRED_WEIGHT);
    });
  });

  describe('getWeightedQuestions', () => {
    const q = (id: string) => ({
      id: 1, questionId: id, testVersion: '2008', category: 'GOV',
      questionText: id, fixedAnswers: ['x'],
      isStarredQuestion: false, isStateSpecific: false, isFederalExecutive: false,
    });

    it('returns the requested count without duplicates', () => {
      const questions = [q('Q1'), q('Q2'), q('Q3'), q('Q4'), q('Q5')];
      const picked = srs.getWeightedQuestions(questions, {}, 3);
      expect(picked.length).toBe(3);
      const ids = new Set(picked.map(p => p.questionId));
      expect(ids.size).toBe(3);
    });

    it('never returns more than the pool size', () => {
      const questions = [q('Q1'), q('Q2')];
      expect(srs.getWeightedQuestions(questions, {}, 20).length).toBe(2);
    });

    it('returns empty for an empty pool', () => {
      expect(srs.getWeightedQuestions([], {}, 5)).toEqual([]);
    });
  });
});
