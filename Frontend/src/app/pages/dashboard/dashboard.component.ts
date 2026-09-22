import { Component, inject, computed, signal, effect, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { CivicsApiService, QuestionOfTheDay } from '../../services/civics-api.service';
import { NotificationService } from '../../services/notification.service';
import { SpeakerButtonComponent } from '../../components/speaker-button/speaker-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SpeakerButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { padding: 20px 16px 80px; max-width: 480px; margin: 0 auto; }

    /* ── Question of the Day ──────────────────────── */
    .qotd {
      background: linear-gradient(155deg, #312e81 0%, #4338ca 100%);
      border-radius: 16px;
      padding: 18px 18px 20px;
      margin-bottom: 20px;
      box-shadow: 0 8px 28px rgba(49, 46, 129, 0.32);
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .qotd::after {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(129,140,248,0.35), transparent 70%);
      pointer-events: none;
    }

    .qotd-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .qotd-badge {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: #fef3c7;
      color: #92400e;
      padding: 4px 9px;
      border-radius: 6px;
    }

    .qotd-date {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
    }

    .qotd-body {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 14px;
    }

    .qotd-question {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.5;
      color: #f5f3ff;
    }

    .qotd-qid {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #c7d2fe;
      display: block;
      margin-bottom: 5px;
    }

    .reveal-btn {
      width: 100%;
      padding: 11px;
      border-radius: 10px;
      border: 1.5px solid rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.10);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .reveal-btn:hover { background: rgba(255,255,255,0.18); }

    .answer-panel {
      margin-top: 12px;
      background: rgba(0,0,0,0.22);
      border-radius: 10px;
      padding: 12px 14px;
      animation: expand 0.28s ease;
    }

    @keyframes expand {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .answer-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .answer-panel-head .lbl {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
    }

    .answer-list { list-style: none; }

    .answer-list li {
      font-size: 14px;
      font-weight: 500;
      color: #e0e7ff;
      padding: 5px 0;
      display: flex;
      align-items: baseline;
      gap: 7px;
    }
    .answer-list li::before { content: '✓'; color: #4ade80; font-weight: 800; }

    /* ── Reminder toggle ── */
    .reminder-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      flex-wrap: wrap;
    }

    .reminder-btn {
      flex: 1;
      min-width: 160px;
      padding: 10px;
      border-radius: 10px;
      border: none;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s, background 0.15s;
    }

    .reminder-off { background: #fbbf24; color: #78350f; }
    .reminder-off:hover { background: #f59e0b; }
    .reminder-on  { background: #16a34a; color: #fff; }
    .reminder-on:hover { background: #15803d; }

    .reminder-test {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1.5px solid rgba(255,255,255,0.25);
      background: transparent;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .reminder-test:hover { background: rgba(255,255,255,0.12); }

    .reminder-hint {
      width: 100%;
      font-size: 11px;
      color: rgba(255,255,255,0.55);
      margin-top: 2px;
    }

    .time-input {
      background: rgba(255,255,255,0.14);
      border: 1.5px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 10px;
      cursor: pointer;
      color-scheme: dark;
    }

    /* ── Header ───────────────────────────────────── */
    .greeting-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .greeting-text h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1e1b4b;
      letter-spacing: -0.02em;
    }

    .greeting-text p {
      font-size: 13px;
      color: #6b7280;
      margin-top: 2px;
    }

    .mastery-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #eef2ff;
      border-radius: 12px;
      padding: 10px 16px;
      min-width: 72px;
    }

    .mastery-badge .pct {
      font-size: 24px;
      font-weight: 700;
      color: #4f46e5;
      line-height: 1;
    }

    .mastery-badge .lbl {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #6366f1;
      margin-top: 2px;
    }

    /* ── Metric Tiles ─────────────────────────────── */
    .tiles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .tile {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 14px 12px;
      text-align: center;
    }

    .tile .tile-val {
      font-size: 22px;
      font-weight: 700;
      color: #1e1b4b;
      line-height: 1.1;
    }

    .tile .tile-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .tile-seen   .tile-val   { color: #4f46e5; }
    .tile-seen   .tile-label { color: #6366f1; }
    .tile-master .tile-val   { color: #16a34a; }
    .tile-master .tile-label { color: #15803d; }
    .tile-review .tile-val   { color: #ef4444; }
    .tile-review .tile-label { color: #b91c1c; }

    /* ── Coverage Bar ─────────────────────────────── */
    .coverage-section {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 16px;
      margin-bottom: 20px;
    }

    .coverage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .coverage-header h3 {
      font-size: 13px;
      font-weight: 600;
      color: #1e1b4b;
    }

    .coverage-header span {
      font-size: 13px;
      font-weight: 700;
      color: #4f46e5;
    }

    .progress-track {
      height: 8px;
      background: #f1f3fb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4f46e5, #818cf8);
      border-radius: 4px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .coverage-sub {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 6px;
    }

    /* ── Need Review ──────────────────────────────── */
    .review-section {
      background: #fff8f0;
      border: 1px solid #fde8c8;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }

    .review-header h3 {
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
    }

    .review-list {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .review-list li {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      background: #fef3c7;
      color: #92400e;
    }

    /* ── Quick Actions ────────────────────────────── */
    .actions { display: flex; gap: 10px; }

    .action-btn {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s, opacity 0.15s;
    }

    .action-btn:active { transform: scale(0.96); }

    .action-btn .icon { font-size: 24px; }

    .action-flash { background: #4f46e5; color: #fff; }
    .action-flash:hover { background: #6366f1; }

    .action-quiz { background: #16a34a; color: #fff; }
    .action-quiz:hover { background: #15803d; }

    /* ── Loading state ────────────────────────────── */
    .loading-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 32px 0;
      color: #6b7280;
      font-size: 13px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid #e2e6f3;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
  `],
  template: `
    <div class="page">
      <!-- Greeting -->
      <div class="greeting-row">
        <div class="greeting-text">
          <h1>{{ greeting() }}</h1>
          <p>{{ state.questions().length }} questions · {{ state.settings().homeState }}</p>
        </div>
        <div class="mastery-badge">
          <span class="pct">{{ state.masteryPercent() }}%</span>
          <span class="lbl">Mastery</span>
        </div>
      </div>

      <!-- ── Question of the Day ── -->
      @if (qotd(); as q) {
        <div class="qotd">
          <div class="qotd-top">
            <span class="qotd-badge">⭐ Question of the Day</span>
            <span class="qotd-date">{{ formatDate(q.date) }}</span>
          </div>

          <div class="qotd-body">
            <div class="qotd-question">
              <span class="qotd-qid">{{ q.questionId }} · {{ q.category }}</span>
              {{ q.questionText }}
            </div>
            <app-speaker-button
              [text]="q.questionText"
              [elementId]="'qotd-q'"
              size="md"
              variant="white"
            />
          </div>

          <button class="reveal-btn" (click)="toggleReveal()">
            {{ revealAnswer() ? '▲ Hide Answer' : '▼ Reveal Answer' }}
          </button>

          @if (revealAnswer()) {
            <div class="answer-panel">
              <div class="answer-panel-head">
                <span class="lbl">Official Answer{{ q.fixedAnswers.length > 1 ? 's' : '' }}</span>
                <app-speaker-button
                  [text]="answerSpeech(q)"
                  [elementId]="'qotd-a'"
                  size="sm"
                  variant="white"
                />
              </div>
              <ul class="answer-list">
                @for (ans of q.fixedAnswers; track ans) {
                  <li>{{ ans }}</li>
                }
              </ul>
            </div>
          }

          <!-- Daily reminder controls -->
          @if (notif.isSupported()) {
            <div class="reminder-row">
              @if (!notif.dailyNotificationEnabled()) {
                <button class="reminder-btn reminder-off" (click)="enableReminder(q)">
                  🔔 Enable Daily Reminder
                </button>
              } @else {
                <button class="reminder-btn reminder-on" (click)="disableReminder()">
                  ✓ Reminder On · {{ notif.scheduledTime() }}
                </button>
                <input
                  class="time-input"
                  type="time"
                  [value]="notif.scheduledTime()"
                  (change)="onTimeChange($event, q)"
                  aria-label="Reminder time"
                />
                <button class="reminder-test" (click)="testNotification(q)">Test</button>
              }
              @if (reminderHint()) {
                <p class="reminder-hint">{{ reminderHint() }}</p>
              }
            </div>
          }
        </div>
      }

      @if (state.isLoadingCivics()) {
        <div class="loading-row">
          <div class="spinner"></div>
          Loading civics data…
        </div>
      } @else {
        <!-- Metric Tiles -->
        <div class="tiles">
          <div class="tile tile-seen">
            <div class="tile-val">{{ state.attemptedIds().size }}<span style="font-size:12px;font-weight:500;color:#9ca3af">/{{ state.questions().length }}</span></div>
            <div class="tile-label">Seen</div>
          </div>
          <div class="tile tile-master">
            <div class="tile-val">{{ state.masteredCount() }}</div>
            <div class="tile-label">Mastered</div>
          </div>
          <div class="tile tile-review">
            <div class="tile-val">{{ state.needReviewIds().length }}</div>
            <div class="tile-label">Review</div>
          </div>
        </div>

        <!-- Coverage Bar -->
        <div class="coverage-section">
          <div class="coverage-header">
            <h3>Overall Coverage</h3>
            <span>{{ state.coveragePercent() }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="state.coveragePercent()"></div>
          </div>
          <p class="coverage-sub">{{ state.attemptedIds().size }} of {{ state.questions().length }} questions practiced</p>
        </div>

        <!-- Need Review -->
        @if (state.needReviewIds().length > 0) {
          <div class="review-section">
            <div class="review-header">
              <span>⚠️</span>
              <h3>Need Review</h3>
            </div>
            <ul class="review-list">
              @for (qid of state.needReviewIds().slice(0, 8); track qid) {
                <li>{{ qid }}</li>
              }
              @if (state.needReviewIds().length > 8) {
                <li>+{{ state.needReviewIds().length - 8 }} more</li>
              }
            </ul>
          </div>
        }

        <!-- Quick Actions -->
        <div class="actions">
          <a routerLink="/flashcards" class="action-btn action-flash">
            <span class="icon">🃏</span>
            Flashcards
          </a>
          <a routerLink="/quiz" class="action-btn action-quiz">
            <span class="icon">📝</span>
            Take Quiz
          </a>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  protected state = inject(AppStateService);
  protected notif = inject(NotificationService);
  private api = inject(CivicsApiService);

  qotd = signal<QuestionOfTheDay | null>(null);
  revealAnswer = signal(false);
  reminderHint = signal('');

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning 👋';
    if (h < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  });

  constructor() {
    // Refetch the daily question whenever the home state changes.
    effect(() => {
      const { homeState, testVersion } = this.state.settings();
      this.loadQotd(homeState, testVersion);
    });
  }

  ngOnInit(): void {
    if (!this.state.hydrated() && !this.state.isLoadingCivics()) {
      const { homeState, testVersion } = this.state.settings();
      this.state.loadQuestions(homeState, testVersion);
    }
  }

  private loadQotd(homeState: string, testVersion: string): void {
    this.api.getQuestionOfTheDay(homeState, testVersion).subscribe(q => {
      this.qotd.set(q);
      this.revealAnswer.set(false);
      if (q) this.notif.restoreOnBoot(q);
    });
  }

  toggleReveal(): void {
    this.revealAnswer.update(v => !v);
  }

  answerSpeech(q: QuestionOfTheDay): string {
    return `Acceptable answer${q.fixedAnswers.length > 1 ? 's' : ''}: ${q.fixedAnswers.join(', or ')}`;
  }

  formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async enableReminder(q: QuestionOfTheDay): Promise<void> {
    const granted = await this.notif.requestPermission();
    if (granted) {
      this.notif.scheduleDailyReminder(this.notif.scheduledTime(), q);
      this.reminderHint.set(`You'll get a daily notification at ${this.notif.scheduledTime()}.`);
    } else {
      this.reminderHint.set('Notifications are blocked. Enable them in your browser settings.');
    }
  }

  disableReminder(): void {
    this.notif.cancelDailyReminder();
    this.reminderHint.set('Daily reminders turned off.');
  }

  onTimeChange(event: Event, q: QuestionOfTheDay): void {
    const time = (event.target as HTMLInputElement).value || '09:00';
    this.notif.scheduleDailyReminder(time, q);
    this.reminderHint.set(`Reminder time updated to ${time}.`);
  }

  testNotification(q: QuestionOfTheDay): void {
    this.notif.sendImmediateNotification(q);
  }
}
