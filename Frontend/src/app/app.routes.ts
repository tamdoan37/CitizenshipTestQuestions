import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { QuizComponent }      from './pages/quiz/quiz.component';
import { SettingsComponent }  from './pages/settings/settings.component';
import { FlashcardsPageComponent } from './pages/flashcards/flashcards-page.component';
import { TipJarComponent } from './pages/tip-jar/tip-jar.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { HistoryComponent } from './pages/history/history.component';
import { AppStateService } from './services/app-state.service';

/** Send first-time visitors to onboarding; returning users straight to the app. */
const onboardingGuard = () => {
  const state = inject(AppStateService);
  const router = inject(Router);
  return state.onboarded() ? true : router.createUrlTree(['/welcome']);
};

export const routes: Routes = [
  { path: '',           component: DashboardComponent,       title: 'CitizenFlow — Home', canActivate: [onboardingGuard] },
  { path: 'welcome',    component: WelcomeComponent,         title: 'CitizenFlow — Welcome' },
  { path: 'flashcards', component: FlashcardsPageComponent,  title: 'CitizenFlow — Flashcards', canActivate: [onboardingGuard] },
  { path: 'quiz',       component: QuizComponent,            title: 'CitizenFlow — Quiz', canActivate: [onboardingGuard] },
  { path: 'history',    component: HistoryComponent,         title: 'CitizenFlow — Quiz History', canActivate: [onboardingGuard] },
  { path: 'settings',   component: SettingsComponent,        title: 'CitizenFlow — Settings', canActivate: [onboardingGuard] },
  { path: 'support',    component: TipJarComponent,          title: 'CitizenFlow — Support Us' },
  { path: '**',         redirectTo: '' },
];
