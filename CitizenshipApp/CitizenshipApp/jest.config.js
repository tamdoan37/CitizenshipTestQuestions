/**
 * Jest config for the pure (non-React-Native) logic modules:
 * spaced-repetition math, quiz scoring, and weighted selection.
 *
 * These modules avoid RN/AsyncStorage imports, so we can run them in a plain
 * Node environment with ts-jest — fast, no native mocking required.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // The pure modules don't need JSX; a lightweight TS config is enough.
        tsconfig: {
          module: "commonjs",
          target: "es2019",
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true,
        },
      },
    ],
  },
};
