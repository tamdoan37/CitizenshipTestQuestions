import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

const US_STATES: Array<{ code: string; name: string }> = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    .hero {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
      /* Deep navy base with a faded Statue of Liberty photo if present in
         assets/. The gradient sits on top so text stays readable even without
         the image. */
      background:
        linear-gradient(160deg, rgba(49,46,129,0.92) 0%, rgba(79,70,229,0.88) 55%, rgba(49,46,129,0.95) 100%),
        radial-gradient(circle at 80% 15%, rgba(129,140,248,0.35), transparent 45%),
        url('/assets/statue-of-liberty.jpg');
      background-size: cover;
      background-position: center;
    }

    .stars {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.35), transparent),
                        radial-gradient(1.5px 1.5px at 70% 60%, rgba(255,255,255,0.25), transparent),
                        radial-gradient(1.5px 1.5px at 40% 80%, rgba(255,255,255,0.2), transparent);
      pointer-events: none;
    }

    .card {
      position: relative;
      width: 100%;
      max-width: 400px;
      background: #ffffff;
      border-radius: 22px;
      padding: 32px 26px 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    }

    .flag { font-size: 40px; text-align: center; margin-bottom: 8px; }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #1e1b4b;
      text-align: center;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin: 8px 0 24px;
      line-height: 1.5;
    }

    label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6366f1;
      margin-bottom: 6px;
    }

    .field { margin-bottom: 18px; }

    input, select {
      width: 100%;
      padding: 13px 14px;
      border-radius: 12px;
      border: 1.5px solid #e2e6f3;
      background: #f8f9ff;
      color: #1e1b4b;
      font-size: 15px;
      font-weight: 500;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus, select:focus { border-color: #4f46e5; }

    .cta {
      width: 100%;
      margin-top: 6px;
      padding: 15px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
    }
    .cta:hover:not(:disabled) { background: #6366f1; }
    .cta:active:not(:disabled) { transform: scale(0.98); }
    .cta:disabled { opacity: 0.5; cursor: not-allowed; }

    .skip {
      display: block;
      width: 100%;
      margin-top: 12px;
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .skip:hover { color: #6b7280; }
  `],
  template: `
    <div class="hero">
      <div class="stars"></div>
      <div class="card">
        <div class="flag">🗽</div>
        <h1>Welcome to CitizenFlow</h1>
        <p class="subtitle">
          Your free, ad-free path to the U.S. Citizenship Test.
          Let's personalize your study.
        </p>

        <div class="field">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            [(ngModel)]="firstName"
            placeholder="e.g. Maria"
            autocomplete="given-name"
            (keyup.enter)="getStarted()"
            name="firstName"
          />
        </div>

        <div class="field">
          <label for="state">Your State</label>
          <select id="state" [(ngModel)]="homeState" name="homeState">
            @for (s of states; track s.code) {
              <option [value]="s.code">{{ s.name }}</option>
            }
          </select>
        </div>

        <button class="cta" [disabled]="!firstName.trim()" (click)="getStarted()">
          Get Started →
        </button>
        <button class="skip" (click)="skip()">Skip for now</button>
      </div>
    </div>
  `,
})
export class WelcomeComponent {
  private state = inject(AppStateService);
  private router = inject(Router);

  protected readonly states = US_STATES;

  firstName = '';
  homeState = 'WI';

  getStarted(): void {
    const name = this.firstName.trim();
    if (!name) return;
    this.state.setUserName(name);
    this.state.updateSettings({ homeState: this.homeState });
    this.router.navigate(['/']);
  }

  skip(): void {
    // Mark onboarding complete with the default name so we don't loop back here.
    this.state.setUserName('Future Citizen');
    this.router.navigate(['/']);
  }
}
