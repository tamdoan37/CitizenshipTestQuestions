import { Component, Input, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../../services/speech.service';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'subtle' | 'white';

/**
 * Reusable speaker/TTS trigger. Highlights + pulses while it is the
 * active speaking element. Click is isolated so it never bubbles into a
 * parent card flip or route navigation.
 */
@Component({
  selector: 'app-speaker-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: inline-flex; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      line-height: 1;
      transition: background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.15s;
      -webkit-tap-highlight-color: transparent;
      flex-shrink: 0;
    }
    button:active { transform: scale(0.9); }
    button:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Sizes ── */
    .size-sm { width: 30px; height: 30px; font-size: 13px; }
    .size-md { width: 38px; height: 38px; font-size: 16px; }
    .size-lg { width: 46px; height: 46px; font-size: 20px; }

    /* ── Variants (idle) ── */
    .variant-primary { background: #eef2ff; color: #4f46e5; }
    .variant-primary:hover:not(:disabled) { background: #e0e7ff; }

    .variant-subtle { background: transparent; color: #9ca3af; }
    .variant-subtle:hover:not(:disabled) { background: #f1f3fb; color: #6b7280; }

    .variant-white { background: rgba(255,255,255,0.14); color: #ffffff; }
    .variant-white:hover:not(:disabled) { background: rgba(255,255,255,0.24); }

    /* ── Active (speaking) ── */
    .speaking {
      animation: pulse 1.2s ease-in-out infinite;
    }
    .speaking.variant-primary,
    .speaking.variant-subtle {
      background: #4f46e5;
      color: #fff;
      border-color: #4f46e5;
    }
    .speaking.variant-white {
      background: #ffffff;
      color: #4f46e5;
      border-color: #ffffff;
    }

    @keyframes pulse {
      0%   { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.45); }
      70%  { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
  `],
  template: `
    @if (speech.isSupported()) {
      <button
        type="button"
        [class]="btnClass()"
        [class.speaking]="isActive()"
        [attr.aria-label]="isActive() ? 'Stop audio' : 'Listen to audio'"
        [attr.aria-pressed]="isActive()"
        [title]="isActive() ? 'Stop' : 'Listen'"
        (click)="onClick($event)"
      >
        {{ isActive() ? '⏸' : '🔊' }}
      </button>
    }
  `,
})
export class SpeakerButtonComponent {
  @Input({ required: true }) text!: string;
  @Input({ required: true }) elementId!: number | string;
  @Input() size: Size = 'md';
  @Input() variant: Variant = 'primary';

  protected speech = inject(SpeechService);

  isActive = computed(() =>
    this.speech.currentSpeakingId() === this.elementId && this.speech.isPlaying()
  );

  btnClass = computed(() => `size-${this.size} variant-${this.variant}`);

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.speech.toggle(this.elementId, this.text);
  }
}
