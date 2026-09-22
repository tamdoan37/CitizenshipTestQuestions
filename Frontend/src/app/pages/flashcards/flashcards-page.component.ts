import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { FlashcardComponent } from '../../components/flashcard/flashcard.component';
import { Question } from '../../services/civics-api.service';

type Filter = 'all' | 'starred' | 'review' | string; // string for category

@Component({
  selector: 'app-flashcards-page',
  standalone: true,
  imports: [CommonModule, FlashcardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { padding: 16px 16px 80px; max-width: 480px; margin: 0 auto; }

    /* ── Top header ───────────────────────────────── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .page-header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1e1b4b;
    }

    .card-count {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
    }

    /* ── Filter pills ─────────────────────────────── */
    .filter-row {
      display: flex;
      gap: 7px;
      overflow-x: auto;
      padding-bottom: 2px;
      margin-bottom: 20px;
      scrollbar-width: none;
    }
    .filter-row::-webkit-scrollbar { display: none; }

    .pill {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1.5px solid #e2e6f3;
      background: #fff;
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .pill.active {
      background: #4f46e5;
      border-color: #4f46e5;
      color: #fff;
    }

    /* ── Progress ─────────────────────────────────── */
    .progress-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .progress-track {
      flex: 1;
      height: 6px;
      background: #f1f3fb;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #4f46e5;
      border-radius: 3px;
      transition: width 0.4s ease;
    }

    .progress-label {
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      white-space: nowrap;
    }

    /* ── Empty state ──────────────────────────────── */
    .empty {
      text-align: center;
      padding: 48px 24px;
      color: #9ca3af;
    }

    .empty .icon { font-size: 36px; margin-bottom: 12px; }
    .empty p { font-size: 14px; }

    /* ── Loading ──────────────────────────────────── */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 48px 0;
      color: #6b7280;
      font-size: 13px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid #e2e6f3;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    /* ── Completion card ──────────────────────────── */
    .done-card {
      background: #dcfce7;
      border-radius: 14px;
      padding: 28px 20px;
      text-align: center;
    }

    .done-card .icon { font-size: 40px; margin-bottom: 10px; }
    .done-card h2 { font-size: 18px; font-weight: 700; color: #14532d; margin-bottom: 6px; }
    .done-card p  { font-size: 13px; color: #166534; }

    .restart-btn {
      margin-top: 16px;
      padding: 11px 24px;
      background: #16a34a;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .restart-btn:hover { background: #15803d; }
  `],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Flashcards</h1>
        <span class="card-count">{{ currentIndex() + 1 }} / {{ filteredQuestions().length }}</span>
      </div>

      <!-- Filter pills -->
      <div class="filter-row">
        <button class="pill" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">All</button>
        <button class="pill" [class.active]="activeFilter() === 'starred'" (click)="setFilter('starred')">⭐ Starred</button>
        <button class="pill" [class.active]="activeFilter() === 'review'" (click)="setFilter('review')">⚠️ Review</button>
        @for (cat of categories(); track cat) {
          <button class="pill" [class.active]="activeFilter() === cat" (click)="setFilter(cat)">
            {{ catShortName(cat) }}
          </button>
        }
      </div>

      <!-- Progress bar -->
      <div class="progress-row">
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="progressPct()"></div>
        </div>
        <span class="progress-label">{{ progressPct() }}%</span>
      </div>

      @if (state.isLoadingCivics()) {
        <div class="loading">
          <div class="spinner"></div>
          Loading questions…
        </div>
      } @else if (filteredQuestions().length === 0) {
        <div class="empty">
          <div class="icon">🔍</div>
          <p>No questions match this filter.</p>
        </div>
      } @else if (isDone()) {
        <div class="done-card">
          <div class="icon">🎉</div>
          <h2>Deck Complete!</h2>
          <p>You've gone through all {{ filteredQuestions().length }} cards in this set.</p>
          <button class="restart-btn" (click)="restart()">Start Over</button>
        </div>
      } @else {
        <app-flashcard
          [question]="currentCard()!"
          [hasPrev]="currentIndex() > 0"
          [starredIds]="starredIds()"
          (next)="nextCard()"
          (prev)="prevCard()"
          (starToggle)="toggleStar($event)"
        />
      }
    </div>
  `,
})
export class FlashcardsPageComponent implements OnInit {
  protected state = inject(AppStateService);

  activeFilter = signal<Filter>('all');
  currentIndex = signal(0);
  starredIds   = signal<Set<string>>(this.loadStarredIds());
  isDone       = signal(false);

  categories = computed(() =>
    [...new Set(this.state.questions().map(q => q.category))].sort()
  );

  filteredQuestions = computed<Question[]>(() => {
    const filter = this.activeFilter();
    const all    = this.state.questions();

    if (filter === 'all')     return all;
    if (filter === 'starred') return all.filter(q => this.starredIds().has(q.questionId));
    if (filter === 'review')  return all.filter(q => this.state.needReviewIds().includes(q.questionId));
    return all.filter(q => q.category === filter);
  });

  currentCard = computed<Question | null>(() => {
    const qs = this.filteredQuestions();
    return qs[this.currentIndex()] ?? null;
  });

  progressPct = computed(() => {
    const total = this.filteredQuestions().length;
    if (total === 0) return 0;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  ngOnInit(): void {
    if (!this.state.hydrated()) {
      const { homeState, testVersion } = this.state.settings();
      this.state.loadQuestions(homeState, testVersion);
    }
  }

  setFilter(f: Filter): void {
    this.activeFilter.set(f);
    this.currentIndex.set(0);
    this.isDone.set(false);
  }

  nextCard(): void {
    const next = this.currentIndex() + 1;
    if (next >= this.filteredQuestions().length) {
      this.isDone.set(true);
    } else {
      this.currentIndex.set(next);
    }
  }

  prevCard(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.isDone.set(false);
    }
  }

  restart(): void {
    this.currentIndex.set(0);
    this.isDone.set(false);
  }

  toggleStar(questionId: string): void {
    this.starredIds.update(ids => {
      const next = new Set(ids);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      this.saveStarredIds(next);
      return next;
    });
  }

  catShortName(cat: string): string {
    if (cat.includes('GOVERNMENT')) return '🏛 Gov';
    if (cat.includes('HISTORY'))    return '📜 History';
    if (cat.includes('SYMBOLS'))    return '🎆 Symbols';
    if (cat.includes('CIVICS'))     return '🗺 Civics';
    return cat;
  }

  private loadStarredIds(): Set<string> {
    try {
      const raw = localStorage.getItem('cf-starred');
      if (!raw) return new Set();
      return new Set(JSON.parse(raw) as string[]);
    } catch { return new Set(); }
  }

  private saveStarredIds(ids: Set<string>): void {
    try { localStorage.setItem('cf-starred', JSON.stringify([...ids])); } catch { /* ignore */ }
  }
}
