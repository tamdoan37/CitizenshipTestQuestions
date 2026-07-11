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
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM"
  ttsRate: number;
}
