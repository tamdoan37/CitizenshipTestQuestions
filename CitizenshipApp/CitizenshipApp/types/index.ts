export type Category =
  | "Principles of American Democracy"
  | "System of Government"
  | "Rights and Responsibilities"
  | "Colonial Period and Independence"
  | "1800s"
  | "Recent American History"
  | "Geography"
  | "Symbols"
  | "Holidays"
  | "Path to Citizenship";

export type Section =
  | "American Government"
  | "American History"
  | "Integrated Civics";

export type DynamicKey =
  | "president" | "vicePresident" | "speakerOfHouse"
  | "chiefJustice" | "governor" | "senators"
  | "representative" | "presidentParty";

export interface Question {
  id: number;
  number: number;
  text: string;
  answers: string[];
  category: Category;
  section: Section;
  isDynamic?: boolean;
  dynamicKey?: DynamicKey;
}

/** Per-question spaced-repetition tracking record. */
export interface QuestionTracker {
  questionId: number;
  correctStreak: number;   // consecutive correct answers
  timesAnswered: number;   // total attempts
  weight: number;          // higher = missed more often, surfaces more often
  lastAttempted: string;   // ISO timestamp, or "" if never attempted
}

export interface CivicsData {
  president: string;
  vicePresident: string;
  speakerOfHouse: string;
  chiefJustice: string;
  governor: string;
  senators: string[];
  representative: string;
  presidentParty: string;
  state: string;
  lastUpdated: string;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  missedQuestions: Question[];
  correctQuestions: Question[];
  duration: number;
}

export interface AppSettings {
  homeState: string;        // 2-letter code, default "WI"
  userName: string;         // from onboarding, default "Future Citizen"
  hasOnboarded: boolean;    // true once onboarding is completed
  dailyGoal: number;        // questions/day: 5 (Light), 10 (Steady), 20 (Intense)
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM"
  ttsRate: number;
  favoriteModes: string[];  // study-mode keys the user pinned as their picks
}

/** A snapshot of one missed question, stored with a quiz so it can be reviewed
 *  later even if the live official answers change. */
export interface MissedQuestionSnapshot {
  id: number;
  number: number;
  category: Category;
  text: string;
  correct: string;         // primary acceptable answer at the time of the quiz
  your: string;            // the answer the user picked ("" if unanswered)
}

/** A completed quiz, stored for the history view (newest first). */
export interface QuizHistoryEntry {
  date: string;            // ISO timestamp
  score: number;
  total: number;
  passed: boolean;
  durationSeconds: number;
  /** Missed questions captured for review. Optional: older entries lack it. */
  missed?: MissedQuestionSnapshot[];
}

/** User-supplied overrides for official names (applied over fetched data). */
export type OfficialsOverride = Partial<
  Pick<
    CivicsData,
    "president" | "vicePresident" | "speakerOfHouse" | "chiefJustice" | "governor" | "presidentParty"
  >
> & {
  /** The state the governor override was entered for; governor only applies
   *  when this matches the currently-fetched state's code. */
  governorState?: string;
};
