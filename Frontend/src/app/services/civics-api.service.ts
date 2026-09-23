import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Question {
  id: number;
  questionId: string;
  testVersion: string;
  category: string;
  questionText: string;
  fixedAnswers: string[];
  isStarredQuestion: boolean;
  isStateSpecific: boolean;
  isFederalExecutive: boolean;
}

export interface StateOfficial {
  id: number;
  stateCode: string;
  stateName: string;
  capital: string;
  governor: string;
  senators: string[];
}

export interface FederalOfficial {
  id: number;
  title: string;
  name: string;
  party: string;
}

export interface FluencySentence {
  id: number;
  exerciseType: string;
  sentenceText: string;
  coreVocabulary: string[];
}

export interface QuestionOfTheDay {
  questionId: string;
  questionText: string;
  category: string;
  fixedAnswers: string[];
  date: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable({ providedIn: 'root' })
export class CivicsApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000';

  // ── Questions ──────────────────────────────────────────────────────────────

  getQuestions(stateCode: string, version = '2025'): Observable<Question[]> {
    const cacheKey = `cf-questions-${stateCode}-${version}`;
    const params = new HttpParams()
      .set('stateCode', stateCode)
      .set('version', version);

    return this.http.get<Question[]>(`${this.baseUrl}/api/quiz/questions`, { params }).pipe(
      tap(data => this.writeCache(cacheKey, data)),
      catchError(() => of(this.readCache<Question[]>(cacheKey) ?? this.getFallbackQuestions()))
    );
  }

  getRandomQuestions(stateCode: string, count = 20, version = '2025'): Observable<Question[]> {
    const params = new HttpParams()
      .set('stateCode', stateCode)
      .set('count', count)
      .set('version', version);

    return this.http.get<Question[]>(`${this.baseUrl}/api/quiz/random`, { params }).pipe(
      catchError(() => {
        const cached = this.readCache<Question[]>(`cf-questions-${stateCode}-${version}`);
        if (!cached) return of([]);
        const shuffled = [...cached].sort(() => Math.random() - 0.5);
        return of(shuffled.slice(0, count));
      })
    );
  }

  getStarredQuestions(stateCode: string, version = '2025'): Observable<Question[]> {
    const params = new HttpParams().set('stateCode', stateCode).set('version', version);
    return this.http.get<Question[]>(`${this.baseUrl}/api/quiz/starred`, { params }).pipe(
      catchError(() => {
        const cached = this.readCache<Question[]>(`cf-questions-${stateCode}-${version}`);
        return of(cached?.filter(q => q.isStarredQuestion) ?? []);
      })
    );
  }

  getCategories(version = '2025'): Observable<string[]> {
    const params = new HttpParams().set('version', version);
    return this.http.get<string[]>(`${this.baseUrl}/api/quiz/categories`, { params }).pipe(
      catchError(() => of(['AMERICAN GOVERNMENT', 'AMERICAN HISTORY', 'SYMBOLS AND HOLIDAYS']))
    );
  }

  getByCategory(category: string, stateCode: string, version = '2025'): Observable<Question[]> {
    const params = new HttpParams()
      .set('category', category)
      .set('stateCode', stateCode)
      .set('version', version);
    return this.http.get<Question[]>(`${this.baseUrl}/api/quiz/by-category`, { params }).pipe(
      catchError(() => {
        const cached = this.readCache<Question[]>(`cf-questions-${stateCode}-${version}`);
        return of(cached?.filter(q => q.category === category) ?? []);
      })
    );
  }

  // ── Question of the Day ──────────────────────────────────────────────────────

  getQuestionOfTheDay(stateCode: string, version = '2025'): Observable<QuestionOfTheDay | null> {
    const cacheKey = `cf-qotd-${stateCode}-${version}`;
    const params = new HttpParams().set('stateCode', stateCode).set('version', version);

    return this.http.get<QuestionOfTheDay>(`${this.baseUrl}/api/quiz/question-of-the-day`, { params }).pipe(
      tap(data => this.writeCache(cacheKey, data)),
      catchError(() => of(this.readCache<QuestionOfTheDay>(cacheKey) ?? this.getFallbackQotd(stateCode, version)))
    );
  }

  // ── States ─────────────────────────────────────────────────────────────────

  getAllStates(): Observable<StateOfficial[]> {
    return this.http.get<StateOfficial[]>(`${this.baseUrl}/api/state`).pipe(
      tap(data => this.writeCache('cf-states', data)),
      catchError(() => of(this.readCache<StateOfficial[]>('cf-states') ?? []))
    );
  }

  getState(stateCode: string): Observable<StateOfficial | null> {
    return this.http.get<StateOfficial>(`${this.baseUrl}/api/state/${stateCode}`).pipe(
      catchError(() => of(null))
    );
  }

  // ── Fluency ────────────────────────────────────────────────────────────────

  getFluencySentences(type?: string): Observable<FluencySentence[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);

    return this.http.get<FluencySentence[]>(`${this.baseUrl}/api/fluency`, { params }).pipe(
      tap(data => this.writeCache(`cf-fluency-${type ?? 'all'}`, data)),
      catchError(() => of(this.readCache<FluencySentence[]>(`cf-fluency-${type ?? 'all'}`) ?? []))
    );
  }

  getRandomFluencySentence(type?: string): Observable<FluencySentence | null> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);

    return this.http.get<FluencySentence>(`${this.baseUrl}/api/fluency/random`, { params }).pipe(
      catchError(() => of(null))
    );
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  getFederalOfficials(adminKey: string): Observable<FederalOfficial[]> {
    return this.http.get<FederalOfficial[]>(`${this.baseUrl}/api/admin/officials/federal`, {
      headers: { 'X-Admin-Key': adminKey }
    });
  }

  updateFederalOfficial(id: number, dto: Partial<FederalOfficial>, adminKey: string): Observable<FederalOfficial> {
    return this.http.put<FederalOfficial>(`${this.baseUrl}/api/admin/officials/federal/${id}`, dto, {
      headers: { 'X-Admin-Key': adminKey }
    });
  }

  /** Update a federal official by role name (President, VicePresident, …). */
  updateFederalOfficialByTitle(title: string, dto: Partial<FederalOfficial>, adminKey: string): Observable<FederalOfficial> {
    return this.http.put<FederalOfficial>(`${this.baseUrl}/api/admin/officials/federal/title/${title}`, dto, {
      headers: { 'X-Admin-Key': adminKey }
    });
  }

  updateStateOfficial(stateCode: string, dto: Partial<StateOfficial>, adminKey: string): Observable<StateOfficial> {
    return this.http.put<StateOfficial>(`${this.baseUrl}/api/admin/officials/state/${stateCode}`, dto, {
      headers: { 'X-Admin-Key': adminKey }
    });
  }

  // ── Cache helpers ──────────────────────────────────────────────────────────

  private writeCache<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* storage full or blocked */ }
  }

  private readCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts: number; data: T };
      if (Date.now() - parsed.ts > CACHE_TTL_MS) { localStorage.removeItem(key); return null; }
      return parsed.data;
    } catch { return null; }
  }

  private getFallbackQuestions(): Question[] {
    // Embedded minimal fallback so the app works with no network and no cache.
    return [
      {
        id: 2, questionId: 'Q002', testVersion: '2025',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What is the supreme law of the land?',
        fixedAnswers: ['(U.S.) Constitution'],
        isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 6, questionId: 'Q006', testVersion: '2025',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What does the Bill of Rights protect?',
        fixedAnswers: ['(The basic) rights of Americans', '(The basic) rights of people living in the United States'],
        isStarredQuestion: false, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 16, questionId: 'Q016', testVersion: '2025',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'Name the three branches of government.',
        fixedAnswers: ['Legislative, executive, and judicial', 'Congress, president, and the courts'],
        isStarredQuestion: false, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 65, questionId: 'Q065', testVersion: '2025',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What are three rights of everyone living in the United States?',
        fixedAnswers: ['Freedom of expression', 'Freedom of speech', 'Freedom of assembly', 'Freedom to petition the government', 'Freedom of religion', 'The right to bear arms'],
        isStarredQuestion: false, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 123, questionId: 'Q123', testVersion: '2025',
        category: 'SYMBOLS AND HOLIDAYS',
        questionText: 'What is the name of the national anthem?',
        fixedAnswers: ['The Star-Spangled Banner'],
        isStarredQuestion: false, isStateSpecific: false, isFederalExecutive: false
      },
    ];
  }

  /** Deterministic offline QOTD: same UTC day → same fallback question. */
  private getFallbackQotd(stateCode: string, version: string): QuestionOfTheDay {
    const date = new Date().toISOString().slice(0, 10);
    const pool = this.readCache<Question[]>(`cf-questions-${stateCode}-${version}`)
      ?? this.getFallbackQuestions();

    let seed = 0;
    for (const ch of date) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
    const q = pool[Math.abs(seed) % pool.length];

    return {
      questionId: q.questionId,
      questionText: q.questionText,
      category: q.category,
      fixedAnswers: q.fixedAnswers,
      date,
    };
  }
}
