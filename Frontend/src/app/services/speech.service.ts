import { Injectable, inject, signal } from '@angular/core';
import { AppStateService } from './app-state.service';

/**
 * Centralized Web Speech API wrapper.
 * A single active utterance is tracked so any component can reflect
 * "who is speaking" via `currentSpeakingId`.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  private state = inject(AppStateService);

  readonly isSupported =
    signal<boolean>(typeof window !== 'undefined' && 'speechSynthesis' in window);

  readonly isPlaying = signal<boolean>(false);
  readonly currentSpeakingId = signal<number | string | null>(null);

  /** Guards against the async `cancel()` → `speak()` race in Chromium. */
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Speak `text`, tagging the utterance with `id` so the UI can highlight
   * the originating control. Cancels any in-flight speech first.
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

  /**
   * If the given `id` is currently speaking, stop. Otherwise start speaking it.
   */
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
