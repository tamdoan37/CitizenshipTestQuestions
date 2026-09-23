import { Injectable, inject, signal } from '@angular/core';
import { AppStateService } from './app-state.service';

/**
 * Centralized Web Speech API wrapper.
 *
 * Handles the two classic browser TTS pitfalls:
 *  1. Voice list loads asynchronously — Chrome returns [] from getVoices()
 *     until the `voiceschanged` event fires. We cache voices and listen for it.
 *  2. Stuck queues — always cancel() before a new utterance.
 *
 * A single active utterance is tracked so any component can reflect
 * "who is speaking" via `currentSpeakingId`.
 *
 * NOTE: speak()/toggle() must be called directly from a user (click) handler —
 * browsers block speech synthesis that isn't tied to a user gesture.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  private state = inject(AppStateService);

  readonly isSupported =
    signal<boolean>(typeof window !== 'undefined' && 'speechSynthesis' in window);

  readonly isPlaying = signal<boolean>(false);
  readonly currentSpeakingId = signal<number | string | null>(null);

  private voices: SpeechSynthesisVoice[] = [];
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (this.isSupported()) {
      this.loadVoices();
      // Chrome populates voices asynchronously; refresh when it signals.
      try {
        window.speechSynthesis.addEventListener('voiceschanged', () => this.loadVoices());
      } catch { /* older browsers: getVoices() is already synchronous */ }
    }
  }

  private loadVoices(): void {
    try {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length) this.voices = list;
    } catch { /* ignore */ }
  }

  /** Pick a natural en-US voice, preferring Google's where available. */
  private pickVoice(): SpeechSynthesisVoice | undefined {
    if (!this.voices.length) this.loadVoices();
    return (
      this.voices.find(v => v.lang === 'en-US' && /google/i.test(v.name)) ??
      this.voices.find(v => v.lang === 'en-US') ??
      this.voices.find(v => v.lang?.startsWith('en'))
    );
  }

  /**
   * Speak `text`, tagging the utterance with `id` so the UI can highlight the
   * originating control. Cancels any in-flight speech first.
   */
  speak(id: number | string, text: string, rate?: number): void {
    if (!this.isSupported() || !text?.trim()) return;

    this.hardCancel();

    const effectiveRate = rate ?? this.state.settings().ttsRate ?? 0.9;

    // 60ms settle: cancel() is async in Chromium; speaking immediately can
    // clobber the new utterance and leave state stuck.
    this.settleTimer = setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';
      utt.rate = Math.min(Math.max(effectiveRate, 0.5), 2.0);
      utt.pitch = 1.0;

      const voice = this.pickVoice();
      if (voice) utt.voice = voice;

      utt.onstart = () => {
        this.isPlaying.set(true);
        this.currentSpeakingId.set(id);
      };
      const reset = () => {
        this.isPlaying.set(false);
        this.currentSpeakingId.set(null);
      };
      utt.onend = reset;
      utt.onerror = reset;

      try {
        window.speechSynthesis.speak(utt);
      } catch {
        reset();
      }
    }, 60);
  }

  /** Stop any active speech and clear tracking state. */
  stop(): void {
    this.hardCancel();
    this.isPlaying.set(false);
    this.currentSpeakingId.set(null);
  }

  /** If `id` is currently speaking, stop; otherwise start speaking it. */
  toggle(id: number | string, text: string, rate?: number): void {
    if (this.currentSpeakingId() === id && this.isPlaying()) {
      this.stop();
    } else {
      this.speak(id, text, rate);
    }
  }

  private hardCancel(): void {
    if (this.settleTimer !== null) {
      clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }
    if (this.isSupported()) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
  }
}
