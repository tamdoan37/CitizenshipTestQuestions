import {
  applyAnswer,
  initialTracker,
  isMastered,
  MIN_WEIGHT,
  MAX_WEIGHT,
  MASTERY_STREAK,
} from "@/services/srs";

const NOW = "2026-01-01T00:00:00.000Z";

describe("initialTracker", () => {
  it("starts neutral", () => {
    const t = initialTracker(42);
    expect(t).toEqual({
      questionId: 42,
      correctStreak: 0,
      timesAnswered: 0,
      weight: 1,
      lastAttempted: "",
    });
  });
});

describe("applyAnswer — correct", () => {
  it("increments streak and timesAnswered, stamps the time", () => {
    const t = applyAnswer(initialTracker(1), true, NOW);
    expect(t.correctStreak).toBe(1);
    expect(t.timesAnswered).toBe(1);
    expect(t.lastAttempted).toBe(NOW);
  });

  it("decays weight downward", () => {
    const t = applyAnswer(initialTracker(1), true, NOW);
    expect(t.weight).toBeLessThan(1);
  });

  it("never decays below the floor", () => {
    let t = initialTracker(1);
    for (let i = 0; i < 20; i++) t = applyAnswer(t, true, NOW);
    expect(t.weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
    expect(t.weight).toBeCloseTo(MIN_WEIGHT, 5);
  });
});

describe("applyAnswer — incorrect", () => {
  it("resets the streak to zero", () => {
    let t = applyAnswer(initialTracker(1), true, NOW); // streak 1
    t = applyAnswer(t, true, NOW); // streak 2
    t = applyAnswer(t, false, NOW); // wrong → reset
    expect(t.correctStreak).toBe(0);
  });

  it("grows weight upward so the question resurfaces", () => {
    const t = applyAnswer(initialTracker(1), false, NOW);
    expect(t.weight).toBeGreaterThan(1);
  });

  it("never grows above the cap", () => {
    let t = initialTracker(1);
    for (let i = 0; i < 20; i++) t = applyAnswer(t, false, NOW);
    expect(t.weight).toBeLessThanOrEqual(MAX_WEIGHT);
  });

  it("a wrong answer always outweighs a fresh question", () => {
    const fresh = initialTracker(2);
    const missed = applyAnswer(initialTracker(1), false, NOW);
    expect(missed.weight).toBeGreaterThan(fresh.weight);
  });
});

describe("isMastered", () => {
  it("is false below the mastery streak", () => {
    let t = applyAnswer(initialTracker(1), true, NOW);
    expect(isMastered(t)).toBe(false);
  });

  it(`is true at ${MASTERY_STREAK} consecutive correct`, () => {
    let t = initialTracker(1);
    for (let i = 0; i < MASTERY_STREAK; i++) t = applyAnswer(t, true, NOW);
    expect(isMastered(t)).toBe(true);
  });

  it("drops back to not-mastered after a miss", () => {
    let t = initialTracker(1);
    for (let i = 0; i < MASTERY_STREAK; i++) t = applyAnswer(t, true, NOW);
    t = applyAnswer(t, false, NOW);
    expect(isMastered(t)).toBe(false);
  });
});
