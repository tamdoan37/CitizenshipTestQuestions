import {
  Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { SrsService } from '../../services/srs.service';
import { ScoringService, QuizResult, QUIZ_SIZE, PASS_THRESHOLD } from '../../services/scoring.service';
import { Question } from '../../services/civics-api.service';

type Phase = 'start' | 'question' | 'result';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { padding: 20px 16px 80px; max-width: 480px; margin: 0 auto; }

    /* ── Start Screen ─────────────────────────────── */
    .start-card {
      background: #fff;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 4px 24px rgba(79,70,229,0.10);
      text-align: center;
    }

    .start-icon { font-size: 48px; margin-bottom: 16px; }

    .start-card h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1e1b4b;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .start-card p {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .start-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 28px;
    }

    .stat-chip {
      background: #f8f9ff;
      border-radius: 10px;
      padding: 12px;
    }

    .stat-chip .val { font-size: 20px; font-weight: 700; color: #4f46e5; }
    .stat-chip .lbl { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }

    .start-btn {
      width: 100%;
      padding: 14px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .start-btn:hover { background: #6366f1; }
    .start-btn:active { transform: scale(0.97); }
    .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Question Screen ──────────────────────────── */
    .q-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .q-counter {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      white-space: nowrap;
    }

    .q-progress {
      flex: 1;
      height: 6px;
      background: #f1f3fb;
      border-radius: 3px;
      overflow: hidden;
    }

    .q-progress-fill {
      height: 100%;
      background: #4f46e5;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .q-card {
      background: #fff;
      border-radius: 16px;
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin-bottom: 16px;
    }

    .q-id-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #6366f1;
      background: #eef2ff;
      padding: 2px 7px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 10px;
    }

    .q-text {
      font-size: 16px;
      font-weight: 600;
      color: #1e1b4b;
      line-height: 1.55;
    }

    .options-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }

    .option-btn {
      width: 100%;
      padding: 14px 16px;
      border-radius: 10px;
      border: 2px solid #e2e6f3;
      background: #fff;
      font-size: 14px;
      font-weight: 500;
      color: #1e1b4b;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, transform 0.1s;
      line-height: 1.4;
    }

    .option-btn:hover:not(:disabled) { border-color: #6366f1; background: #eef2ff; }
    .option-btn:active:not(:disabled) { transform: scale(0.98); }
    .option-btn:disabled { cursor: default; }

    .option-btn.correct  { background: #dcfce7; border-color: #16a34a; color: #14532d; }
    .option-btn.wrong    { background: #fee2e2; border-color: #ef4444; color: #7f1d1d; }
    .option-btn.selected { border-color: #4f46e5; background: #eef2ff; }

    .feedback-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 8px;
      margin-top: 12px;
      font-size: 13px;
      font-weight: 600;
    }

    .feedback-correct { background: #dcfce7; color: #15803d; }
    .feedback-wrong   { background: #fee2e2; color: #b91c1c; }

    .next-btn {
      width: 100%;
      padding: 13px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 16px;
      transition: background 0.15s, transform 0.1s;
    }
    .next-btn:hover { background: #6366f1; }
    .next-btn:active { transform: scale(0.97); }

    /* ── Result Screen ────────────────────────────── */
    .result-card {
      background: #fff;
      border-radius: 16px;
      padding: 28px 24px;
      box-shadow: 0 4px 24px rgba(79,70,229,0.10);
      text-align: center;
    }

    .result-icon { font-size: 56px; margin-bottom: 12px; }

    .result-card h2 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .pass-text { color: #16a34a; }
    .fail-text { color: #ef4444; }

    .score-display {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 16px 0 4px;
    }

    .score-pass { color: #16a34a; }
    .score-fail { color: #ef4444; }

    .score-sub {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 20px;
    }

    .result-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }

    .result-meta-item {
      background: #f8f9ff;
      border-radius: 10px;
      padding: 12px;
    }

    .result-meta-item .val { font-size: 18px; font-weight: 700; color: #1e1b4b; }
    .result-meta-item .lbl { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }

    .result-actions { display: flex; flex-direction: column; gap: 10px; }

    .btn-restart {
      padding: 13px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-restart:hover { background: #6366f1; }

    .btn-home {
      padding: 13px;
      background: #f1f3fb;
      color: #4f46e5;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: block;
    }
  `],
  template: `
    <div class="page">
      <!-- ── Start Phase ── -->
      @if (phase() === 'start') {
        <div class="start-card">
          <div class="start-icon">📝</div>
          <h1>Civics Quiz</h1>
          <p>
            {{ QUIZ_SIZE }} questions · pass {{ PASS_THRESHOLD }}/{{ QUIZ_SIZE }} correct<br>
            Questions weighted by your progress history.
          </p>

          <div class="start-stats">
            <div class="stat-chip">
              <div class="val">{{ state.questions().length }}</div>
              <div class="lbl">Questions</div>
            </div>
            <div class="stat-chip">
              <div class="val">{{ state.masteryPercent() }}%</div>
              <div class="lbl">Mastery</div>
            </div>
          </div>

          <button
            class="start-btn"
            [disabled]="state.questions().length === 0"
            (click)="startQuiz()"
          >
            {{ state.questions().length === 0 ? 'Loading questions…' : 'Start Quiz' }}
          </button>
        </div>
      }

      <!-- ── Question Phase ── -->
      @if (phase() === 'question' && currentQuestion()) {
        <div class="q-header">
          <span class="q-counter">{{ currentIndex() + 1 }} / {{ quizQuestions().length }}</span>
          <div class="q-progress">
            <div class="q-progress-fill" [style.width.%]="progressPct()"></div>
          </div>
        </div>

        <div class="q-card">
          <span class="q-id-badge">{{ currentQuestion()!.questionId }}</span>
          <p class="q-text">{{ currentQuestion()!.questionText }}</p>
        </div>

        <ul class="options-list">
          @for (opt of currentOptions(); track opt.text) {
            <li>
              <button
                class="option-btn"
                [class.correct]="selectedAnswer() !== null && opt.isCorrect"
                [class.wrong]="selectedAnswer() === opt.text && !opt.isCorrect"
                [class.selected]="selectedAnswer() === opt.text && opt.isCorrect"
                [disabled]="selectedAnswer() !== null"
                (click)="selectAnswer(opt)"
              >
                {{ opt.text }}
              </button>
            </li>
          }
        </ul>

        @if (selectedAnswer() !== null) {
          <div class="feedback-row" [class.feedback-correct]="lastAnswerCorrect()" [class.feedback-wrong]="!lastAnswerCorrect()">
            <span>{{ lastAnswerCorrect() ? '✓ Correct!' : '✗ Incorrect' }}</span>
            @if (!lastAnswerCorrect()) {
              <span>— {{ currentQuestion()!.fixedAnswers[0] }}</span>
            }
          </div>
          <button class="next-btn" (click)="advance()">
            {{ currentIndex() + 1 < quizQuestions().length ? 'Next Question →' : 'See Results' }}
          </button>
        }
      }

      <!-- ── Result Phase ── -->
      @if (phase() === 'result' && quizResult()) {
        <div class="result-card">
          <div class="result-icon">{{ quizResult()!.isPassed ? '🎉' : '📚' }}</div>
          <h2 [class.pass-text]="quizResult()!.isPassed" [class.fail-text]="!quizResult()!.isPassed">
            {{ quizResult()!.isPassed ? 'Congratulations!' : 'Keep Studying' }}
          </h2>
          <div class="score-display" [class.score-pass]="quizResult()!.isPassed" [class.score-fail]="!quizResult()!.isPassed">
            {{ quizResult()!.correctCount }}/{{ quizResult()!.totalQuestions }}
          </div>
          <p class="score-sub">
            {{ quizResult()!.scorePercent }}% correct ·
            {{ quizResult()!.isPassed ? 'PASS — meets USCIS requirement' : 'Need ≥ 60% to pass' }}
          </p>

          <div class="result-meta">
            <div class="result-meta-item">
              <div class="val">{{ quizResult()!.correctCount }}</div>
              <div class="lbl">Correct</div>
            </div>
            <div class="result-meta-item">
              <div class="val">{{ quizResult()!.totalQuestions - quizResult()!.correctCount }}</div>
              <div class="lbl">Incorrect</div>
            </div>
            <div class="result-meta-item">
              <div class="val">{{ formatDuration(quizResult()!.duration) }}</div>
              <div class="lbl">Time</div>
            </div>
            <div class="result-meta-item">
              <div class="val">{{ state.masteryPercent() }}%</div>
              <div class="lbl">Overall Mastery</div>
            </div>
          </div>

          <div class="result-actions">
            <button class="btn-restart" (click)="restartQuiz()">Try Again</button>
            <a routerLink="/" class="btn-home">← Back to Dashboard</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class QuizComponent implements OnInit, OnDestroy {
  protected state   = inject(AppStateService);
  private srs       = inject(SrsService);
  private scoring   = inject(ScoringService);

  protected readonly QUIZ_SIZE       = QUIZ_SIZE;
  protected readonly PASS_THRESHOLD  = PASS_THRESHOLD;

  phase          = signal<Phase>('start');
  quizQuestions  = signal<Question[]>([]);
  currentIndex   = signal<number>(0);
  currentOptions = signal<QuizOption[]>([]);
  selectedAnswer = signal<string | null>(null);
  lastAnswerCorrect = signal<boolean>(false);
  quizResult     = signal<QuizResult | null>(null);

  // Track raw user answers: questionId → chosen text
  private answersMap: Record<string, string> = {};
  private startTime = 0;

  currentQuestion = computed<Question | null>(() => {
    const qs = this.quizQuestions();
    const i  = this.currentIndex();
    return qs[i] ?? null;
  });

  progressPct = computed<number>(() => {
    const total = this.quizQuestions().length;
    if (total === 0) return 0;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  ngOnInit(): void {
    if (!this.state.hydrated()) {
      const { homeState, testVersion } = this.state.settings();
      this.state.loadQuestions(homeState, testVersion);
    }
  }

  ngOnDestroy(): void { /* nothing to tear down */ }

  startQuiz(): void {
    const all = this.state.questions();
    if (all.length === 0) return;

    const trackers = this.state.trackers();
    const selected = this.srs.getWeightedQuestions(all, trackers, QUIZ_SIZE);

    this.quizQuestions.set(selected);
    this.currentIndex.set(0);
    this.selectedAnswer.set(null);
    this.answersMap = {};
    this.startTime = Date.now();
    this.quizResult.set(null);

    this.buildOptionsForCurrent(selected, 0);
    this.phase.set('question');
  }

  selectAnswer(opt: QuizOption): void {
    if (this.selectedAnswer() !== null) return;

    const q = this.currentQuestion();
    if (!q) return;

    this.selectedAnswer.set(opt.text);
    this.lastAnswerCorrect.set(opt.isCorrect);
    this.answersMap[q.questionId] = opt.text;
  }

  advance(): void {
    const next = this.currentIndex() + 1;

    if (next >= this.quizQuestions().length) {
      this.finishQuiz();
      return;
    }

    this.currentIndex.set(next);
    this.selectedAnswer.set(null);
    this.buildOptionsForCurrent(this.quizQuestions(), next);
  }

  restartQuiz(): void {
    this.phase.set('start');
    this.quizResult.set(null);
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private finishQuiz(): void {
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    // Score uses exact text match from our answers map
    const result = this.scoring.scoreQuiz(
      this.quizQuestions(),
      this.answersMap,
      duration
    );

    this.state.recordAnswers(result.answersById);
    this.quizResult.set(result);
    this.phase.set('result');
  }

  private buildOptionsForCurrent(questions: Question[], index: number): void {
    const q = questions[index];
    if (!q || q.fixedAnswers.length === 0) {
      this.currentOptions.set([]);
      return;
    }

    // Pick one correct answer randomly
    const correctText = q.fixedAnswers[Math.floor(Math.random() * q.fixedAnswers.length)];

    // Build distractor pool from other questions (different answer sets)
    const pool: string[] = questions
      .filter((_, i) => i !== index)
      .flatMap(other => other.fixedAnswers)
      .filter(a => !q.fixedAnswers.includes(a));

    // Shuffle and pick 3 unique distractors
    const shuffledPool = pool.sort(() => Math.random() - 0.5);
    const distractors: string[] = [];
    const seen = new Set<string>([correctText]);

    for (const d of shuffledPool) {
      if (!seen.has(d)) {
        seen.add(d);
        distractors.push(d);
      }
      if (distractors.length === 3) break;
    }

    // Pad with generic options if pool is too small
    while (distractors.length < 3) {
      distractors.push(`Option ${distractors.length + 2}`);
    }

    const options: QuizOption[] = [
      { text: correctText, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    this.currentOptions.set(options);
  }
}
