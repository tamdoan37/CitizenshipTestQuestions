import * as Speech from "expo-speech";

/**
 * Text-to-speech wrapper around expo-speech.
 *
 * Fixes the classic issues:
 *  - Voice list loads asynchronously (especially on web / Chrome). We resolve
 *    and cache a natural en-US voice once, preferring Google's.
 *  - Always stop the current utterance before speaking a new one, so a rapid
 *    second tap doesn't queue behind a stuck utterance.
 *
 * Call speak() directly from a press handler — browsers block speech that
 * isn't tied to a user gesture.
 */

let cachedVoiceId: string | undefined;
let voicesResolved = false;

async function resolveVoice(): Promise<string | undefined> {
  if (voicesResolved) return cachedVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // On web/Chrome the voice list is often empty on the first call (voices
    // load asynchronously). Only latch once we actually have voices, so we
    // retry on later calls instead of permanently falling back to the default.
    if (!voices || voices.length === 0) return undefined;
    const pick =
      voices.find((v) => v.language === "en-US" && /google/i.test(v.name ?? "")) ??
      voices.find((v) => v.language === "en-US") ??
      voices.find((v) => (v.language ?? "").startsWith("en"));
    cachedVoiceId = pick?.identifier;
    voicesResolved = true;
  } catch {
    // Transient failure — leave unresolved so the next call retries.
    return undefined;
  }
  return cachedVoiceId;
}

export const speech = {
  async speak(text: string, rate = 0.9): Promise<void> {
    if (!text?.trim()) return;
    try { Speech.stop(); } catch { /* ignore */ }
    const voice = await resolveVoice();
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
