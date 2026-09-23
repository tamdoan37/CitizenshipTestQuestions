import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: #f4f6fd;
    }

    .content {
      flex: 1;
      overflow-y: auto;
    }

    /* ── Bottom Nav ───────────────────────────────── */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #ffffff;
      border-top: 1px solid #e8eaf6;
      display: flex;
      align-items: stretch;
      z-index: 100;
      box-shadow: 0 -2px 12px rgba(79, 70, 229, 0.08);
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-decoration: none;
      color: #9ca3af;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    .nav-item .nav-icon {
      font-size: 22px;
      line-height: 1;
      transition: transform 0.15s;
    }

    .nav-item:active .nav-icon {
      transform: scale(0.88);
    }

    .nav-item.active {
      color: #4f46e5;
    }

    .nav-item.active .nav-icon {
      filter: drop-shadow(0 2px 4px rgba(79, 70, 229, 0.35));
    }
  `],
  template: `
    <div class="content">
      <router-outlet />
    </div>

    @if (showNav()) {
    <nav class="bottom-nav">
      <a class="nav-item"
         routerLink="/"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: true }">
        <span class="nav-icon">🏠</span>
        Home
      </a>
      <a class="nav-item"
         routerLink="/flashcards"
         routerLinkActive="active">
        <span class="nav-icon">🃏</span>
        Flashcards
      </a>
      <a class="nav-item"
         routerLink="/quiz"
         routerLinkActive="active">
        <span class="nav-icon">📝</span>
        Quiz
      </a>
      <a class="nav-item"
         routerLink="/settings"
         routerLinkActive="active">
        <span class="nav-icon">⚙️</span>
        Settings
      </a>
    </nav>
    }
  `,
})
export class AppComponent {
  private router = inject(Router);

  /** Hide the bottom nav on full-screen routes (welcome, support modal). */
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  showNav = () => {
    const url = this.currentUrl().split('?')[0];
    return url !== '/welcome' && url !== '/support';
  };
}
