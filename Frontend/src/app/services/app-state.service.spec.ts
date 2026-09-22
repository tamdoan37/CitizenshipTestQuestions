import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppStateService } from './app-state.service';
import { CivicsApiService, Question } from './civics-api.service';
import { SrsService } from './srs.service';

const sampleQuestions: Question[] = [
  {
    id: 1, questionId: 'Q001', testVersion: '2008', category: 'GOV',
    questionText: 'Supreme law?', fixedAnswers: ['the Constitution'],
    isStarredQuestion: false, isStateSpecific: false, isFederalExecutive: false,
  },
];

describe('AppStateService', () => {
  let getQuestionsSpy: jasmine.Spy;

  beforeEach(() => {
    try { localStorage.clear(); } catch { /* ignore */ }

    getQuestionsSpy = jasmine.createSpy('getQuestions').and.returnValue(of(sampleQuestions));

    TestBed.configureTestingModule({
      providers: [
        AppStateService,
        SrsService,
        { provide: CivicsApiService, useValue: { getQuestions: getQuestionsSpy } },
      ],
    });
  });

  it('is created with default settings', () => {
    const state = TestBed.inject(AppStateService);
    expect(state).toBeTruthy();
    expect(state.settings().homeState).toBe('WI');
    expect(state.settings().testVersion).toBe('2008');
  });

  it('updates the settings signal when updateSettings is called', () => {
    const state = TestBed.inject(AppStateService);
    state.updateSettings({ homeState: 'TX' });
    expect(state.settings().homeState).toBe('TX');
    // Unchanged keys are preserved.
    expect(state.settings().testVersion).toBe('2008');
  });

  it('re-fetches questions via CivicsApiService when the home state changes', () => {
    const state = TestBed.inject(AppStateService);
    TestBed.flushEffects();          // run the initial load effect
    getQuestionsSpy.calls.reset();

    state.updateSettings({ homeState: 'TX' });
    TestBed.flushEffects();          // run the reactive re-fetch effect

    expect(getQuestionsSpy).toHaveBeenCalledWith('TX', '2008');
  });

  it('persists settings to localStorage', () => {
    const state = TestBed.inject(AppStateService);
    state.updateSettings({ homeState: 'CA' });
    TestBed.flushEffects();
    const raw = localStorage.getItem('cf-settings');
    expect(raw).toContain('CA');
  });

  it('records a correct answer and increments the tracker streak', () => {
    const state = TestBed.inject(AppStateService);
    state.questions.set(sampleQuestions);
    state.recordAnswer('Q001', true);
    const tracker = state.trackers()['Q001'];
    expect(tracker.correctStreak).toBe(1);
    expect(tracker.totalCorrect).toBe(1);
  });

  it('marks a question mastered after MASTERY_STREAK consecutive correct answers', () => {
    const state = TestBed.inject(AppStateService);
    state.questions.set(sampleQuestions);
    state.recordAnswer('Q001', true);
    state.recordAnswer('Q001', true);
    expect(state.masteredIds().has('Q001')).toBe(true);
    expect(state.masteredCount()).toBe(1);
  });

  it('resets all progress', () => {
    const state = TestBed.inject(AppStateService);
    state.questions.set(sampleQuestions);
    state.recordAnswer('Q001', true);
    state.resetProgress();
    expect(Object.keys(state.trackers()).length).toBe(0);
  });
});
