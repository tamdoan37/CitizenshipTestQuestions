import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { CivicsApiService, StateOfficial } from '../../services/civics-api.service';

const TTS_RATES = [
  { label: '0.7× Slow',   value: 0.7 },
  { label: '0.9× Default', value: 0.9 },
  { label: '1.0× Normal',  value: 1.0 },
  { label: '1.2× Fast',    value: 1.2 },
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { padding: 20px 16px 80px; max-width: 480px; margin: 0 auto; }

    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1e1b4b;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
    }

    /* ── Section ──────────────────────────────────── */
    .section {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      overflow: hidden;
      margin-bottom: 16px;
    }

    .section-header {
      padding: 14px 16px 10px;
      border-bottom: 1px solid #f1f3fb;
    }

    .section-header h2 {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #9ca3af;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #f8f9ff;
      gap: 12px;
    }

    .setting-row:last-child { border-bottom: none; }

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: #1e1b4b;
    }

    .setting-desc {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 2px;
    }

    select {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #e2e6f3;
      background: #f8f9ff;
      color: #1e1b4b;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      outline: none;
      max-width: 180px;
    }

    select:focus { border-color: #4f46e5; }

    /* ── Rate buttons ─────────────────────────────── */
    .rate-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .rate-btn {
      padding: 7px 12px;
      border-radius: 6px;
      border: 1.5px solid #e2e6f3;
      background: #f8f9ff;
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .rate-btn.active {
      background: #eef2ff;
      border-color: #4f46e5;
      color: #4f46e5;
    }

    /* ── TTS preview ──────────────────────────────── */
    .tts-preview-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 14px;
      border-radius: 8px;
      border: none;
      background: #4f46e5;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .tts-preview-btn:hover { background: #6366f1; }
    .tts-preview-btn.playing { background: #ef4444; }

    /* ── State card ───────────────────────────────── */
    .state-card {
      background: #f0f4ff;
      border-radius: 10px;
      padding: 12px 14px;
      margin: 0 16px 14px;
    }

    .state-card .gov-name {
      font-size: 14px;
      font-weight: 600;
      color: #1e1b4b;
    }

    .state-card .senators {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    /* ── Reset section ────────────────────────────── */
    .danger-section { background: #fff; border-radius: 14px; overflow: hidden; }

    .reset-btn {
      width: 100%;
      padding: 14px;
      background: #fee2e2;
      color: #b91c1c;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .reset-btn:hover { background: #fecaca; }

    .confirm-row {
      display: flex;
      gap: 10px;
      padding: 14px 16px;
    }

    .confirm-row button {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-confirm-reset { background: #ef4444; color: #fff; }
    .btn-cancel        { background: #f1f3fb; color: #6b7280; }

    /* ── Version info ─────────────────────────────── */
    .version-row {
      text-align: center;
      padding: 24px 0 8px;
      font-size: 11px;
      color: #d1d5db;
    }
  `],
  template: `
    <div class="page">
      <h1>Settings</h1>

      <!-- ── Study Settings ── -->
      <div class="section">
        <div class="section-header"><h2>Study</h2></div>

        <!-- State Selector -->
        <div class="setting-row">
          <div>
            <div class="setting-label">Home State</div>
            <div class="setting-desc">Personalizes senators, governor & capital</div>
          </div>
          <select
            [value]="state.settings().homeState"
            (change)="onStateChange($event)"
          >
            @for (s of allStates(); track s.stateCode) {
              <option [value]="s.stateCode">{{ s.stateCode }} — {{ s.stateName }}</option>
            }
          </select>
        </div>

        <!-- State official preview -->
        @if (selectedState()) {
          <div class="state-card">
            <div class="gov-name">🏛 Gov. {{ selectedState()!.governor }}</div>
            <div class="senators">Senators: {{ selectedState()!.senators.join(', ') }}</div>
          </div>
        }

        <!-- Test Version -->
        <div class="setting-row">
          <div>
            <div class="setting-label">Test Version</div>
            <div class="setting-desc">2025 test (128 questions) for N-400 filed on/after Oct 20, 2025</div>
          </div>
          <select
            [value]="state.settings().testVersion"
            (change)="onVersionChange($event)"
          >
            <option value="2025">2025 (128 questions)</option>
          </select>
        </div>
      </div>

      <!-- ── Text-to-Speech ── -->
      <div class="section">
        <div class="section-header"><h2>Text-to-Speech</h2></div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Reading Speed</div>
            <div class="setting-desc">Used in flashcards and fluency exercises</div>
          </div>
          <div class="rate-buttons">
            @for (rate of TTS_RATES; track rate.value) {
              <button
                class="rate-btn"
                [class.active]="state.settings().ttsRate === rate.value"
                (click)="setRate(rate.value)"
              >{{ rate.label }}</button>
            }
          </div>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Preview Voice</div>
            <div class="setting-desc">Hear the current speed setting</div>
          </div>
          <button
            class="tts-preview-btn"
            [class.playing]="isPlaying()"
            (click)="previewTts()"
          >
            {{ isPlaying() ? '⏹ Stop' : '🔊 Play' }}
          </button>
        </div>
      </div>

      <!-- ── Progress ── -->
      <div class="section">
        <div class="section-header"><h2>Progress</h2></div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Questions Mastered</div>
          </div>
          <span style="font-size:15px;font-weight:700;color:#16a34a">{{ state.masteredCount() }} / {{ state.questions().length }}</span>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Overall Mastery</div>
          </div>
          <span style="font-size:15px;font-weight:700;color:#4f46e5">{{ state.masteryPercent() }}%</span>
        </div>
      </div>

      <!-- ── Support ── -->
      <div class="section">
        <div class="section-header"><h2>Support this app</h2></div>
        <button class="setting-row" style="width:100%;background:none;border:none;text-align:left;cursor:pointer;" (click)="goSupport()">
          <div>
            <div class="setting-label">❤️ Support this app</div>
            <div class="setting-desc">Optional tips keep it free and support St. Paul Children's Hospital</div>
          </div>
          <span style="font-size:18px;color:#9ca3af;">›</span>
        </button>
      </div>

      <!-- ── Danger Zone ── -->
      <div class="danger-section">
        @if (!confirmReset()) {
          <button class="reset-btn" (click)="confirmReset.set(true)">
            🗑 Reset All Progress
          </button>
        } @else {
          <div class="confirm-row">
            <button class="btn-cancel" (click)="confirmReset.set(false)">Cancel</button>
            <button class="btn-confirm-reset" (click)="doReset()">Yes, Reset Everything</button>
          </div>
        }
      </div>

      <p class="version-row">CitizenFlow v1.0 · USCIS 2025 Test (128 Questions)</p>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  protected state = inject(AppStateService);
  private api     = inject(CivicsApiService);
  private router  = inject(Router);

  protected readonly TTS_RATES = TTS_RATES;

  allStates    = signal<StateOfficial[]>([]);
  isPlaying    = signal(false);
  confirmReset = signal(false);

  selectedState = computed(() => {
    const code = this.state.settings().homeState;
    return this.allStates().find(s => s.stateCode === code) ?? null;
  });

  ngOnInit(): void {
    this.api.getAllStates().subscribe(states => this.allStates.set(states));
  }

  onStateChange(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.state.updateSettings({ homeState: code });
  }

  onVersionChange(event: Event): void {
    const version = (event.target as HTMLSelectElement).value;
    this.state.updateSettings({ testVersion: version });
  }

  setRate(rate: number): void {
    this.state.updateSettings({ ttsRate: rate });
  }

  previewTts(): void {
    if (!('speechSynthesis' in window)) return;

    if (this.isPlaying()) {
      window.speechSynthesis.cancel();
      this.isPlaying.set(false);
      return;
    }

    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(
        'What do we call the first ten amendments to the Constitution? The Bill of Rights.'
      );
      utt.lang  = 'en-US';
      utt.rate  = this.state.settings().ttsRate;
      utt.onend   = () => this.isPlaying.set(false);
      utt.onerror = () => this.isPlaying.set(false);
      this.isPlaying.set(true);
      window.speechSynthesis.speak(utt);
    }, 60);
  }

  doReset(): void {
    this.state.resetProgress();
    this.confirmReset.set(false);
  }

  goSupport(): void {
    this.router.navigate(['/support']);
  }
}
