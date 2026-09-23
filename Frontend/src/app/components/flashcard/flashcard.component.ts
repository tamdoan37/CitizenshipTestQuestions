import {
  Component, Input, Output, EventEmitter, signal, computed, inject, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../services/civics-api.service';
import { AppStateService } from '../../services/app-state.service';
import { SpeechService } from '../../services/speech.service';
import { SpeakerButtonComponent } from '../speaker-button/speaker-button.component';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, SpeakerButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    /* ── 3D Flip Container ─────────────────────────────── */
    .card-scene {
      perspective: 1200px;
      width: 100%;
      height: 300px;
    }

    .card-flipper {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .card-flipper.flipped { transform: rotateY(180deg); }

    .card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    /* ── Front ─────────────────────────────────────────── */
    .card-front {
      background: #ffffff;
      box-shadow: 0 4px 24px rgba(79, 70, 229, 0.12), 0 1px 4px rgba(0,0,0,0.06);
    }

    .front-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .question-id {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #6366f1;
      background: #eef2ff;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .question-text {
      flex: 1;
      font-size: 17px;
      font-weight: 600;
      color: #1e1b4b;
      line-height: 1.5;
      margin-top: 4px;
    }

    .flip-hint {
      margin-top: auto;
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
      padding-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    /* ── Back ──────────────────────────────────────────── */
    .card-back {
      background: #312e81;
      transform: rotateY(180deg);
      box-shadow: 0 4px 24px rgba(49, 46, 129, 0.30);
    }

    .back-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .back-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
    }

    .answers-list {
      flex: 1;
      list-style: none;
      overflow-y: auto;
    }

    .answer-item {
      font-size: 14px;
      font-weight: 500;
      color: #e0e7ff;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .answer-item:last-child { border-bottom: none; }
    .answer-item.dim { color: #c7d2fe; opacity: 0.8; }

    .answer-item::before {
      content: '·';
      color: #818cf8;
      font-weight: 900;
      flex-shrink: 0;
    }

    .ans-text { flex: 1; }

    .pin {
      flex-shrink: 0;
      border: none;
      background: rgba(255,255,255,0.10);
      border-radius: 8px;
      padding: 4px 7px;
      font-size: 13px;
      cursor: pointer;
      line-height: 1;
      opacity: 0.6;
      transition: opacity 0.15s, background 0.15s, transform 0.1s;
    }
    .pin:hover { opacity: 1; background: rgba(255,255,255,0.18); }
    .pin:active { transform: scale(0.9); }
    .pin.pinned { opacity: 1; background: rgba(251,191,36,0.22); }

    .show-all {
      align-self: flex-start;
      margin: 6px 0 2px;
      border: none;
      background: none;
      color: #a5b4fc;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 0;
    }
    .show-all:hover { color: #c7d2fe; }

    .back-flip-hint {
      margin-top: 12px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      text-align: center;
    }

    /* ── Controls bar (outside flip so taps never trigger flip) ── */
    .controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      gap: 8px;
    }

    .ctrl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 16px;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }

    .ctrl-btn:hover { background: #e0e7ff; }
    .ctrl-btn:active { transform: scale(0.92); }

    .ctrl-btn.tts-active { background: #4f46e5; color: #fff; }

    .ctrl-btn.star-active { background: #fef3c7; color: #f59e0b; }

    .nav-btns {
      display: flex;
      gap: 8px;
      flex: 1;
      justify-content: flex-end;
    }

    .nav-btn {
      flex: 1;
      max-width: 120px;
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: opacity 0.15s, transform 0.1s;
    }
    .nav-btn:active { transform: scale(0.96); }

    .btn-prev { background: #f1f3fb; color: #6b7280; }
    .btn-prev:disabled { opacity: 0.35; cursor: not-allowed; }

    .btn-next { background: #4f46e5; color: #fff; }
    .btn-next:hover { background: #6366f1; }

    /* ── Category badge ────────────────────────────────── */
    .cat-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 3px;
    }

    .cat-gov  { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
    .cat-his  { background: rgba(251, 191, 36, 0.2); color: #fcd34d; }
    .cat-civ  { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; }

    .mastered-chip {
      font-size: 10px;
      font-weight: 600;
      color: #16a34a;
      background: #dcfce7;
      padding: 2px 7px;
      border-radius: 3px;
    }
  `],
  template: `
    @if (question) {
      <!-- 3D Flip Card (clicking the card surface flips it) -->
      <div class="card-scene">
        <div
          class="card-flipper"
          [class.flipped]="isFlipped()"
          (click)="flip()"
          role="button"
          [attr.aria-label]="isFlipped() ? 'Show question (tap to flip)' : 'Show answer (tap to flip)'"
        >
          <!-- Front face -->
          <div class="card-face card-front">
            <div class="front-header">
              <span class="question-id">{{ question.questionId }}</span>
              @if (isMastered()) {
                <span class="mastered-chip">✓ Mastered</span>
              }
            </div>
            <p class="question-text">{{ question.questionText }}</p>
            <div class="flip-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Tap card to see answers
            </div>
          </div>

          <!-- Back face -->
          <div class="card-face card-back">
            <div class="back-header">
              <span [class]="catBadgeClass()">{{ question.category }}</span>
              <span class="back-label">{{ hasPreferred() ? 'Your Selected Answers' : 'Acceptable Answers' }}</span>
            </div>

            @if (hasPreferred()) {
              <!-- Pinned (easiest) answers first -->
              <ul class="answers-list">
                @for (ans of preferredList(); track ans) {
                  <li class="answer-item">
                    <span class="ans-text">{{ ans }}</span>
                    <button class="pin pinned" (click)="togglePin(ans); $event.stopPropagation()"
                      aria-label="Unpin answer" title="Unpin">📌</button>
                  </li>
                }
              </ul>
              @if (otherList().length > 0) {
                <button class="show-all" (click)="toggleShowAll(); $event.stopPropagation()">
                  {{ showAll() ? '▲ Hide extra answers' : '▼ Show All Acceptable Answers (' + otherList().length + ')' }}
                </button>
                @if (showAll()) {
                  <ul class="answers-list">
                    @for (ans of otherList(); track ans) {
                      <li class="answer-item dim">
                        <span class="ans-text">{{ ans }}</span>
                        <button class="pin" (click)="togglePin(ans); $event.stopPropagation()"
                          aria-label="Pin answer" title="Pin as easiest">📍</button>
                      </li>
                    }
                  </ul>
                }
              }
            } @else {
              <ul class="answers-list">
                @for (ans of question.fixedAnswers; track ans) {
                  <li class="answer-item">
                    <span class="ans-text">{{ ans }}</span>
                    <button class="pin" (click)="togglePin(ans); $event.stopPropagation()"
                      aria-label="Pin answer" title="Pin as easiest">📍</button>
                  </li>
                }
              </ul>
            }
            <p class="back-flip-hint">Tap card to return · 📍 pin your easiest answers</p>
          </div>
        </div>
      </div>

      <!-- Controls bar — outside flip container to avoid tap conflicts -->
      <div class="controls-bar">
        <!-- Star button -->
        <button
          class="ctrl-btn"
          [class.star-active]="isStarred()"
          (click)="toggleStar(); $event.stopPropagation()"
          [attr.aria-label]="isStarred() ? 'Unstar question' : 'Star question'"
          title="Star"
        >
          {{ isStarred() ? '★' : '☆' }}
        </button>

        <!-- TTS button (reads whichever face is showing) -->
        <app-speaker-button
          [text]="visibleText()"
          [elementId]="speakerId()"
          size="md"
          variant="primary"
        />

        <!-- Prev / Next -->
        <div class="nav-btns">
          <button class="nav-btn btn-prev" [disabled]="!hasPrev" (click)="prev.emit(); $event.stopPropagation()">
            ← Prev
          </button>
          <button class="nav-btn btn-next" (click)="next.emit(); $event.stopPropagation()">
            Next →
          </button>
        </div>
      </div>
    }
  `,
})
export class FlashcardComponent {
  @Input({ required: true }) question!: Question;
  @Input() hasPrev = false;
  @Input() starredIds: Set<string> = new Set();

  @Output() next       = new EventEmitter<void>();
  @Output() prev       = new EventEmitter<void>();
  @Output() starToggle = new EventEmitter<string>();

  private state  = inject(AppStateService);
  private speech = inject(SpeechService);

  isFlipped  = signal(false);
  showAll    = signal(false);

  isStarred  = computed(() => this.starredIds.has(this.question?.questionId ?? ''));
  isMastered = computed(() => this.state.isMastered(this.question?.questionId ?? ''));

  // Preferred-answer helpers (plain getters so they re-read the current
  // question input and the preferredAnswers signal on every change detection).
  hasPreferred(): boolean {
    return this.preferredList().length > 0;
  }

  preferredList(): string[] {
    const pinned = this.state.getPreferred(this.question?.questionId ?? '');
    // Keep only pinned answers that still exist in this question's answer set.
    return (this.question?.fixedAnswers ?? []).filter(a => pinned.includes(a));
  }

  otherList(): string[] {
    const pinned = this.state.getPreferred(this.question?.questionId ?? '');
    return (this.question?.fixedAnswers ?? []).filter(a => !pinned.includes(a));
  }

  togglePin(answer: string): void {
    if (this.question) this.state.togglePreferredAnswer(this.question.questionId, answer);
  }

  toggleShowAll(): void {
    this.showAll.update(v => !v);
  }

  /** Text for the currently visible face. */
  visibleText = computed(() =>
    this.isFlipped()
      ? `Acceptable answers: ${this.question?.fixedAnswers?.join(', or ') ?? ''}`
      : (this.question?.questionText ?? '')
  );

  /** Distinct id per face so highlighting tracks front vs back independently. */
  speakerId = computed(() =>
    `flash-${this.question?.questionId ?? 'na'}-${this.isFlipped() ? 'a' : 'q'}`
  );

  catBadgeClass = computed(() => {
    const c = this.question?.category ?? '';
    if (c.includes('GOVERNMENT')) return 'cat-badge cat-gov';
    if (c.includes('HISTORY'))    return 'cat-badge cat-his';
    return 'cat-badge cat-civ';
  });

  flip(): void {
    this.isFlipped.update(v => !v);
    this.speech.stop();
  }

  toggleStar(): void {
    this.starToggle.emit(this.question.questionId);
  }

  /** Reset flip state when navigating to a new card. */
  ngOnChanges(): void {
    this.isFlipped.set(false);
    this.showAll.set(false);
    this.speech.stop();
  }
}
