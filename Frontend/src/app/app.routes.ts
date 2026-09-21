import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { QuizComponent }      from './pages/quiz/quiz.component';
import { SettingsComponent }  from './pages/settings/settings.component';
import { FlashcardsPageComponent } from './pages/flashcards/flashcards-page.component';

export const routes: Routes = [
  { path: '',           component: DashboardComponent,    title: 'CitizenFlow — Home' },
  { path: 'flashcards', component: FlashcardsPageComponent, title: 'CitizenFlow — Flashcards' },
  { path: 'quiz',       component: QuizComponent,         title: 'CitizenFlow — Quiz' },
  { path: 'settings',   component: SettingsComponent,     title: 'CitizenFlow — Settings' },
  { path: '**',         redirectTo: '' },
];
