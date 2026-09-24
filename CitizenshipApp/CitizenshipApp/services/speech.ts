import * as Speech from "expo-speech";

/**
 * Text-to-speech wrapper around expo-speech.
 *
 *  - Voices load asynchronously (especially on web / Chrome). We resolve and
 *    cache an en-US voice once we actually have a list, retrying otherwise.
 *  - Optional male/female preference: expo-speech exposes no gender field, so we
 *    match on the voice name/identifier (Android ids often contain
 *    "male"/"female"; iOS uses known voice names). Best-effort — falls back to
 *    the default en-US voice when no gendered match exists on the device.
 *  - Always stop the current utterance before speaking a new one.
 */

export type VoiceGender = "female" | "male";

let cachedVoices: Speech.Voice[] | null = null;
const voiceIdByKey: Record<string, string | undefined> = {};
let preferredGender: VoiceGender | null = null;

// "female" contains the substring "male", so test female first / guard male.
// Covers common voice names across iOS, Android, Windows, Edge and Chrome.
const FEMALE = /(female|samantha|karen|moira|tessa|victoria|ava|allison|susan|zoe|nicky|fiona|serena|kate|stephanie|catherine|nora|joana|luciana|paulina|zira|aria|jenny|michelle|\bana\b|eva|hazel|emma|amber|ashley|cora|elizabeth|monica|nova|sonia|clara|google us english)/i;
const MALE = /([#_\- .]male|^male|aaron|fred|daniel|\balex\b|arthur|thomas|rishi|gordon|oliver|reed|evan|nathan|diego|jorge|xander|david|\bmark\b|\bguy\b|christopher|\beric\b|roger|steffan|brandon|william|james|benjamin|liam|noah)/i;

export function setVoiceGender(gender: VoiceGender | null | undefined): void {
  preferredGender = gender ?? null;
}

async function ensureVoices(): Promise<Speech.Voice[] | null> {
  if (cachedVoices && cachedVoices.length) return cachedVoices;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) return null; // retry next time
    cachedVoices = voices;
    return voices;
  } catch {
    return null;
  }
}

async function resolveVoiceId(): Promise<string | undefined> {
  const key = preferredGender ?? "default";
  if (key in voiceIdByKey) return voiceIdByKey[key];

  const voices = await ensureVoices();
  if (!voices) return undefined; // unresolved — retry on a later call

  const en = voices.filter((v) => (v.language ?? "").toLowerCase().startsWith("en"));
  const enUS = en.filter((v) => (v.language ?? "").toLowerCase() === "en-us");
  const pool = enUS.length ? enUS : en;

  const matches = (v: Speech.Voice, re: RegExp) =>
    re.test(`${v.name ?? ""} ${v.identifier ?? ""}`);

  let pick: Speech.Voice | undefined;
  if (preferredGender === "female") {
    pick = pool.find((v) => matches(v, FEMALE));
  } else if (preferredGender === "male") {
    pick = pool.find((v) => matches(v, MALE) && !matches(v, FEMALE));
  }
  // Fall back to a natural en-US voice (prefer Google's on Android/web).
  pick =
    pick ??
    pool.find((v) => /google/i.test(v.name ?? "")) ??
    pool[0];

  voiceIdByKey[key] = pick?.identifier;
  return voiceIdByKey[key];
}

export const speech = {
  /** Resolve the voice id for the current gender preference (for callers that
   *  drive expo-speech directly, e.g. Listen mode's onDone chaining). */
  async getVoiceId(): Promise<string | undefined> {
    return resolveVoiceId();
  },

  setVoiceGender,

  async speak(text: string, rate = 0.9): Promise<void> {
    if (!text?.trim()) return;
    try { Speech.stop(); } catch { /* ignore */ }
    const voice = await resolveVoiceId();
    try {
      Speech.speak(text, {
        language: "en-US",
        rate: Math.min(Math.max(rate, 0.5), 2),
        pitch: 1.0,
        voice,
      });
    } catch { /* ignore — TTS unavailable on this platform */ }
  },

  stop(): void {
    try { Speech.stop(); } catch { /* ignore */ }
  },
};
