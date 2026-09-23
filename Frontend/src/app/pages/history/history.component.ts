import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { padding: 20px 16px 80px; max-width: 480px; margin: 0 auto; }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    h1 { font-size: 22px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.02em; }
    .clear-btn {
      background: none; border: none; color: #ef4444;
      font-size: 13px; font-weight: 600; cursor: pointer;
    }

    /* ── Summary tiles ── */
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .tile {
      background: #fff; border-radius: 12px; padding: 14px 12px; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .tile .val { font-size: 20px; font-weight: 700; color: #1e1b4b; }
    .tile .lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #9ca3af; margin-top: 4px; }

    /* ── List ── */
    .list { display: flex; flex-direction: column; gap: 10px; }

    .row {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #fff;
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-left: 4px solid transparent;
    }
    .row.pass { border-left-color: #16a34a; }
    .row.fail { border-left-color: #ef4444; }

    .badge {
      width: 46px; height: 46px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 800; flex-shrink: 0;
    }
    .badge.pass { background: #dcfce7; color: #15803d; }
    .badge.fail { background: #fee2e2; color: #b91c1c; }

    .row-main { flex: 1; }
    .row-score { font-size: 15px; font-weight: 700; color: #1e1b4b; }
    .row-score .status-pass { color: #16a34a; }
    .row-score .status-fail { color: #ef4444; }
    .row-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    .row-time { font-size: 12px; color: #6b7280; font-weight: 600; white-space: nowrap; }

    /* ── Empty ── */
    .empty { text-align: center; padding: 56px 24px; color: #9ca3af; }
    .empty .icon { font-size: 40px; margin-bottom: 12px; }
    .empty p { font-size: 14px; margin-bottom: 20px; }
    .empty a {
      display: inline-block; padding: 12px 22px; background: #4f46e5; color: #fff;
      border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none;
    }
  `],
  template: `
    <div class="page">
      <div class="header">
        <h1>Quiz History</h1>
        @if (history().length > 0) {
          <button class="clear-btn" (click)="clear()">Clear</button>
        }
      </div>

      @if (history().length === 0) {
        <div class="empty">
          <div class="icon">📊</div>
          <p>No quizzes yet. Take your first practice test to start tracking your progress!</p>
          <a routerLink="/quiz">Take a Quiz</a>
        </div>
      } @else {
        <div class="summary">
          <div class="tile">
            <div class="val">{{ history().length }}</div>
            <div class="lbl">Taken</div>
          </div>
          <div class="tile">
            <div class="val" style="color:#16a34a">{{ passedCount() }}</div>
            <div class="lbl">Passed</div>
          </div>
          <div class="tile">
            <div class="val" style="color:#4f46e5">{{ bestPercent() }}%</div>
            <div class="lbl">Best</div>
          </div>
        </div>

        <div class="list">
          @for (h of history(); track h.date) {
            <div class="row" [class.pass]="h.isPassed" [class.fail]="!h.isPassed">
              <div class="badge" [class.pass]="h.isPassed" [class.fail]="!h.isPassed">
                {{ h.scorePercent }}%
              </div>
              <div class="row-main">
                <div class="row-score">
                  {{ h.correctCount }}/{{ h.totalQuestions }} correct ·
                  <span [class.status-pass]="h.isPassed" [class.status-fail]="!h.isPassed">
                    {{ h.isPassed ? 'Passed' : 'Failed' }}
                  </span>
                </div>
                <div class="row-date">{{ formatDate(h.date) }}</div>
              </div>
              <div class="row-time">{{ formatDuration(h.durationSeconds) }}</div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class HistoryComponent {
  protected state = inject(AppStateService);

  history = this.state.quizHistory;

  passedCount = computed(() => this.history().filter(h => h.isPassed).length);
  bestPercent = computed(() =>
    this.history().reduce((max, h) => Math.max(max, h.scorePercent), 0)
  );

  clear(): void {
    this.state.clearQuizHistory();
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
