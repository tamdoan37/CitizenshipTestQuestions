import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupporterService } from '../../services/supporter.service';

@Component({
  selector: 'app-tip-jar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { padding: 24px 16px 80px; max-width: 480px; margin: 0 auto; }

    .card {
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(79, 70, 229, 0.10);
      padding: 28px 22px 24px;
      text-align: center;
    }

    .heart {
      width: 76px;
      height: 76px;
      margin: 0 auto 18px;
      border-radius: 50%;
      background: #eef2ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      color: #e11d48;
      animation: beat 1.6s ease-in-out infinite;
    }

    @keyframes beat {
      0%, 100% { transform: scale(1); }
      15% { transform: scale(1.12); }
      30% { transform: scale(1); }
    }

    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1e1b4b;
      line-height: 1.35;
      margin-bottom: 18px;
      letter-spacing: -0.01em;
    }

    .body {
      font-size: 14px;
      line-height: 1.65;
      color: #4b5563;
      text-align: left;
      white-space: pre-line;   /* preserve the paragraph + list line breaks */
      margin-bottom: 24px;
    }

    .cta {
      width: 100%;
      padding: 15px;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .cta:hover:not(:disabled) { background: #6366f1; }
    .cta:active:not(:disabled) { transform: scale(0.98); }
    .cta:disabled { opacity: 0.7; cursor: default; }

    .back {
      display: inline-block;
      margin-top: 14px;
      padding: 12px;
      width: 100%;
      background: #f1f3fb;
      color: #4f46e5;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .back:hover { background: #e2e6f3; }

    .free-note {
      margin-top: 18px;
      font-size: 12px;
      color: #9ca3af;
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.5);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  template: `
    <div class="page">
      <div class="card">
        <div class="heart" aria-hidden="true">❤️</div>

        <h1>Support CitizenFlow &amp; St. Paul Children's Hospital</h1>

        <p class="body">{{ bodyText }}</p>

        <button class="cta" (click)="donate()" [disabled]="supporter.opening()">
          @if (supporter.opening()) {
            <span class="spinner"></span> Opening…
          } @else {
            Support the Mission
          }
        </button>

        <a class="back" routerLink="/">← Back to Dashboard</a>

        <p class="free-note">CitizenFlow is 100% free and ad-free. Tips are always optional.</p>
      </div>
    </div>
  `,
})
export class TipJarComponent {
  protected supporter = inject(SupporterService);

  protected readonly bodyText =
    "I built CitizenFlow to be a 100% free, ad-free resource for anyone studying for their US Citizenship test. Education should be accessible to everyone.\n\n" +
    "If this app helped you pass your test, please consider leaving a tip! Your donations go toward two things:\n" +
    "1. Covering the monthly server costs to keep the app running for future citizens.\n" +
    "2. 100% of all remaining proceeds are donated directly to St. Paul Children's Hospital.\n\n" +
    "Thank you for supporting accessible education and helping kids in need!";

  donate(): void {
    void this.supporter.openDonationPage();
  }
}
