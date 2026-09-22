import { TestBed } from '@angular/core/testing';
import { ScoringService, PASS_THRESHOLD, QUIZ_SIZE } from './scoring.service';
import { Question } from './civics-api.service';

function makeQuestion(id: string, answers: string[]): Question {
  return {
    id: parseInt(id.replace(/\D/g, ''), 10) || 0,
    questionId: id,
    testVersion: '2008',
    category: 'AMERICAN GOVERNMENT',
    questionText: `Question ${id}?`,
    fixedAnswers: answers,
    isStarredQuestion: false,
    isStateSpecific: false,
    isFederalExecutive: false,
  };
}

describe('ScoringService', () => {
  let scoring: ScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    scoring = TestBed.inject(ScoringService);
  });

  describe('normalize', () => {
    it('lowercases, trims, and collapses whitespace', () => {
      expect(scoring.normalize(' The CONSTITUTION  ')).toBe('the constitution');
    });
    it('collapses internal multi-spaces', () => {
      expect(scoring.normalize('the   Bill   of   Rights')).toBe('the bill of rights');
    });
    it('strips trailing punctuation', () => {
      expect(scoring.normalize('the Constitution.')).toBe('the constitution');
      expect(scoring.normalize('Washington!')).toBe('washington');
    });
  });

  describe('isAnswerCorrect', () => {
    const q = makeQuestion('Q001', ['the Constitution']);

    it('matches with casing and spacing variations', () => {
      expect(scoring.isAnswerCorrect(q, 'the constitution')).toBe(true);
      expect(scoring.isAnswerCorrect(q, '  THE   Constitution ')).toBe(true);
    });

    it('rejects wrong answers', () => {
      expect(scoring.isAnswerCorrect(q, 'the declaration')).toBe(false);
    });

    it('rejects empty input', () => {
      expect(scoring.isAnswerCorrect(q, '   ')).toBe(false);
    });

    it('matches any acceptable answer in the list', () => {
      const multi = makeQuestion('Q006', ['speech', 'religion', 'assembly', 'press']);
      expect(scoring.isAnswerCorrect(multi, 'Religion')).toBe(true);
      expect(scoring.isAnswerCorrect(multi, 'PRESS')).toBe(true);
    });

    it('handles parenthetical hints on both sides', () => {
      const jefferson = makeQuestion('Q070', ['(Thomas) Jefferson']);
      expect(scoring.isAnswerCorrect(jefferson, 'Jefferson')).toBe(true);
      expect(scoring.isAnswerCorrect(jefferson, 'Thomas Jefferson')).toBe(true);
    });
  });

  describe('scoreQuiz', () => {
    it('scores 12/20 correct as a pass', () => {
      const questions = Array.from({ length: QUIZ_SIZE }, (_, i) =>
        makeQuestion(`Q${String(i + 1).padStart(3, '0')}`, [`answer-${i}`]));

      const answers: Record<string, string> = {};
      questions.forEach((qq, i) => {
        // First 12 correct, remaining 8 wrong.
        answers[qq.questionId] = i < PASS_THRESHOLD ? `answer-${i}` : 'totally-wrong';
      });

      const result = scoring.scoreQuiz(questions, answers, 300);

      expect(result.totalQuestions).toBe(20);
      expect(result.correctCount).toBe(12);
      expect(result.isPassed).toBe(true);
      expect(result.scorePercent).toBe(60);
      expect(result.duration).toBe(300);
    });

    it('scores 11/20 correct as a fail (below threshold)', () => {
      const questions = Array.from({ length: QUIZ_SIZE }, (_, i) =>
        makeQuestion(`Q${String(i + 1).padStart(3, '0')}`, [`answer-${i}`]));

      const answers: Record<string, string> = {};
      questions.forEach((qq, i) => {
        answers[qq.questionId] = i < 11 ? `answer-${i}` : 'nope';
      });

      const result = scoring.scoreQuiz(questions, answers, 200);
      expect(result.correctCount).toBe(11);
      expect(result.isPassed).toBe(false);
    });

    it('treats missing answers as incorrect', () => {
      const questions = [makeQuestion('Q001', ['yes']), makeQuestion('Q002', ['no'])];
      const result = scoring.scoreQuiz(questions, { Q001: 'yes' }, 10);
      expect(result.correctCount).toBe(1);
      expect(result.answersById['Q002']).toBe(false);
    });
  });

  describe('editDistance & similarity', () => {
    it('returns 0 distance for identical (normalized) strings', () => {
      expect(scoring.editDistance('Constitution', 'constitution ')).toBe(0);
    });
    it('returns full similarity for equal strings', () => {
      expect(scoring.similarity('hello', 'hello')).toBe(1);
    });
    it('computes a partial similarity for near matches', () => {
      const sim = scoring.similarity('constitution', 'consttution');
      expect(sim).toBeGreaterThan(0.8);
      expect(sim).toBeLessThan(1);
    });
  });
});
