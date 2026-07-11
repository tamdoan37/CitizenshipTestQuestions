import { isAnswerCorrect, scoreQuiz, normalize } from "@/services/scoring";
import type { Question } from "@/types";

function q(id: number, answers: string[]): Question {
  return {
    id,
    number: id,
    text: `Question ${id}`,
    answers,
    category: "System of Government",
    section: "American Government",
  };
}

describe("normalize", () => {
  it("lowercases and trims", () => {
    expect(normalize("  George Washington  ")).toBe("george washington");
  });
});

describe("isAnswerCorrect", () => {
  const question = q(1, ["George Washington", "Washington"]);

  it("matches case-insensitively", () => {
    expect(isAnswerCorrect(question, "george washington")).toBe(true);
  });

  it("matches with surrounding whitespace", () => {
    expect(isAnswerCorrect(question, "  Washington ")).toBe(true);
  });

  it("accepts any listed answer", () => {
    expect(isAnswerCorrect(question, "Washington")).toBe(true);
  });

  it("rejects a wrong answer", () => {
    expect(isAnswerCorrect(question, "Thomas Jefferson")).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(isAnswerCorrect(question, "")).toBe(false);
  });
});

describe("scoreQuiz", () => {
  const questions = [
    q(1, ["A"]),
    q(2, ["B"]),
    q(3, ["C"]),
    q(4, ["D"]),
    q(5, ["E"]),
  ];

  it("counts correct and missed", () => {
    const answers = { 1: "A", 2: "B", 3: "wrong", 4: "D", 5: "" };
    const result = scoreQuiz(questions, answers, 1000, 3);
    expect(result.score).toBe(3);
    expect(result.total).toBe(5);
    expect(result.missedQuestions.map((m) => m.id)).toEqual([3, 5]);
    expect(result.correctQuestions.map((c) => c.id)).toEqual([1, 2, 4]);
  });

  it("passes at or above the threshold", () => {
    const answers = { 1: "A", 2: "B", 3: "C" };
    const result = scoreQuiz(questions, answers, 0, 3);
    expect(result.passed).toBe(true);
  });

  it("fails below the threshold", () => {
    const answers = { 1: "A", 2: "B" };
    const result = scoreQuiz(questions, answers, 0, 3);
    expect(result.passed).toBe(false);
  });

  it("treats unanswered questions as missed", () => {
    const result = scoreQuiz(questions, {}, 0, 3);
    expect(result.score).toBe(0);
    expect(result.missedQuestions).toHaveLength(5);
  });

  it("carries duration through", () => {
    const result = scoreQuiz(questions, { 1: "A" }, 4242, 3);
    expect(result.duration).toBe(4242);
  });

  it("uses the real 12/20 default threshold", () => {
    const twenty = Array.from({ length: 20 }, (_, i) => q(i + 1, [`ans${i + 1}`]));
    const answers: Record<number, string> = {};
    for (let i = 1; i <= 12; i++) answers[i] = `ans${i}`;
    const result = scoreQuiz(twenty, answers, 0); // default threshold = 12
    expect(result.score).toBe(12);
    expect(result.passed).toBe(true);
  });
});
