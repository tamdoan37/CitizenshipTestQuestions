import { QUESTIONS, getWeightedQuestions } from "@/data/questions";

describe("question bank integrity", () => {
  it("contains 128 questions", () => {
    expect(QUESTIONS).toHaveLength(128);
  });

  it("has unique ids", () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(QUESTIONS.length);
  });

  it("every question has at least one answer", () => {
    expect(QUESTIONS.every((q) => q.answers.length > 0)).toBe(true);
  });
});

describe("getWeightedQuestions", () => {
  it("draws the requested count", () => {
    const drawn = getWeightedQuestions(20, {});
    expect(drawn).toHaveLength(20);
  });

  it("never repeats a question (no replacement)", () => {
    const drawn = getWeightedQuestions(20, {});
    const ids = new Set(drawn.map((q) => q.id));
    expect(ids.size).toBe(20);
  });

  it("clamps count to the pool size", () => {
    const drawn = getWeightedQuestions(9999, {});
    expect(drawn).toHaveLength(QUESTIONS.length);
  });

  it("strongly favors high-weight questions over many trials", () => {
    // Give one question an overwhelming weight; it should appear far more often.
    const target = QUESTIONS[0].id;
    const weights: Record<number, number> = { [target]: 1000 };

    let hits = 0;
    const TRIALS = 200;
    for (let i = 0; i < TRIALS; i++) {
      const drawn = getWeightedQuestions(1, weights);
      if (drawn[0].id === target) hits++;
    }
    // With weight 1000 vs 1 for 127 others, expect a large majority.
    expect(hits).toBeGreaterThan(TRIALS * 0.7);
  });

  it("falls back to uniform behaviour with empty weights", () => {
    // Should still return valid, in-bank questions.
    const drawn = getWeightedQuestions(5, {});
    expect(drawn.every((q) => QUESTIONS.some((x) => x.id === q.id))).toBe(true);
  });
});
