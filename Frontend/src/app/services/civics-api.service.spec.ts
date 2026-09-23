import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CivicsApiService, Question } from './civics-api.service';

const BASE = 'http://localhost:5000';

const mockQuestions: Question[] = [
  {
    id: 1, questionId: 'Q001', testVersion: '2008',
    category: 'AMERICAN GOVERNMENT',
    questionText: 'What is the supreme law of the land?',
    fixedAnswers: ['the Constitution'],
    isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false,
  },
  {
    id: 43, questionId: 'Q043', testVersion: '2008',
    category: 'AMERICAN GOVERNMENT',
    questionText: 'Who is the Governor of your state now?',
    fixedAnswers: ['Tony Evers'],
    isStarredQuestion: false, isStateSpecific: true, isFederalExecutive: false,
  },
];

describe('CivicsApiService', () => {
  let service: CivicsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    try { localStorage.clear(); } catch { /* ignore */ }
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CivicsApiService],
    });
    service = TestBed.inject(CivicsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('forms the correct GET request for getQuestions with stateCode and version params', () => {
    service.getQuestions('WI', '2008').subscribe();

    const req = httpMock.expectOne(
      r => r.url === `${BASE}/api/quiz/questions`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('stateCode')).toBe('WI');
    expect(req.request.params.get('version')).toBe('2008');
    req.flush(mockQuestions);
  });

  it('maps the JSON response to the Question[] interface', (done) => {
    service.getQuestions('WI', '2008').subscribe(questions => {
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(2);
      expect(questions[0].questionId).toBe('Q001');
      expect(questions[0].fixedAnswers).toEqual(['the Constitution']);
      expect(questions[1].isStateSpecific).toBe(true);
      done();
    });

    const req = httpMock.expectOne(r => r.url === `${BASE}/api/quiz/questions`);
    req.flush(mockQuestions);
  });

  it('falls back to embedded questions when the API errors and no cache exists', (done) => {
    service.getQuestions('ZZ', '2008').subscribe(questions => {
      // Embedded fallback is non-empty so the app still works offline.
      expect(questions.length).toBeGreaterThan(0);
      done();
    });

    const req = httpMock.expectOne(r => r.url === `${BASE}/api/quiz/questions`);
    req.error(new ProgressEvent('network error'));
  });

  it('requests the Question of the Day with state + version params', () => {
    service.getQuestionOfTheDay('WI', '2008').subscribe();

    const req = httpMock.expectOne(r => r.url === `${BASE}/api/quiz/question-of-the-day`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('stateCode')).toBe('WI');
    expect(req.request.params.get('version')).toBe('2008');
    req.flush({
      questionId: 'Q001', questionText: 'What is the supreme law of the land?',
      category: 'AMERICAN GOVERNMENT', fixedAnswers: ['the Constitution'], date: '2026-09-22',
    });
  });

  it('sends the X-Admin-Key header on admin requests', () => {
    service.getFederalOfficials('secret-key').subscribe();

    const req = httpMock.expectOne(`${BASE}/api/admin/officials/federal`);
    expect(req.request.headers.get('X-Admin-Key')).toBe('secret-key');
    req.flush([]);
  });
});
