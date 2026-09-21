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

// ── Service ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable({ providedIn: 'root' })
export class CivicsApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000';

  // ── Questions ──────────────────────────────────────────────────────────────

  getQuestions(stateCode: string, version = '2008'): Observable<Question[]> {
    const cacheKey = `cf-questions-${stateCode}-${version}`;
    const params = new HttpParams()
      .set('stateCode', stateCode)
      .set('version', version);

    return this.http.get<Question[]>(`${this.baseUrl}/api/quiz/questions`, { params }).pipe(
      tap(data => this.writeCache(cacheKey, data)),
      catchError(() => of(this.readCache<Question[]>(cacheKey) ?? this.getFallbackQuestions()))
    );
  }

  getRandomQuestions(stateCode: string, count = 20, version = '2008'): Observable<Question[]> {
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

  getStarredQuestions(stateCode: string, version = '2008'): Observable<Question[]> {
    const params = new HttpParams().set('stateCode', stateCode).set('version', version);
    return this.http.get<Question[]>(`${this.baseUrl}/api/quiz/starred`, { params }).pipe(
      catchError(() => {
        const cached = this.readCache<Question[]>(`cf-questions-${stateCode}-${version}`);
        return of(cached?.filter(q => q.isStarredQuestion) ?? []);
      })
    );
  }

  getCategories(version = '2008'): Observable<string[]> {
    const params = new HttpParams().set('version', version);
    return this.http.get<string[]>(`${this.baseUrl}/api/quiz/categories`, { params }).pipe(
      catchError(() => of(['AMERICAN GOVERNMENT', 'AMERICAN HISTORY', 'INTEGRATED CIVICS']))
    );
  }

  getByCategory(category: string, stateCode: string, version = '2008'): Observable<Question[]> {
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
        id: 1, questionId: 'Q001', testVersion: '2008',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What is the supreme law of the land?',
        fixedAnswers: ['the Constitution'],
        isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 5, questionId: 'Q005', testVersion: '2008',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What do we call the first ten amendments to the Constitution?',
        fixedAnswers: ['the Bill of Rights'],
        isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 6, questionId: 'Q006', testVersion: '2008',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What is one right or freedom from the First Amendment?',
        fixedAnswers: ['speech', 'religion', 'assembly', 'press', 'petition the government'],
        isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 13, questionId: 'Q013', testVersion: '2008',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'Name one branch or part of the government.',
        fixedAnswers: ['Congress', 'legislative', 'President', 'executive', 'the courts', 'judicial'],
        isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false
      },
      {
        id: 17, questionId: 'Q017', testVersion: '2008',
        category: 'AMERICAN GOVERNMENT',
        questionText: 'What are the two parts of the U.S. Congress?',
        fixedAnswers: ['the Senate and House of Representatives'],
        isStarredQuestion: true, isStateSpecific: false, isFederalExecutive: false
      },
    ];
  }
}
