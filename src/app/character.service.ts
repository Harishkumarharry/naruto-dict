import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private http = inject(HttpClient);
  // Use a simple hardcoded API URL for now (no injection tokens)
  // Replace this with your real endpoint if desired.
  private readonly API_URL = 'https://dattebayo-api.onrender.com/characters';
  // Allow headers to be set at runtime for debugging (e.g. Authorization)
  private API_HEADERS?: Record<string, string> | undefined = undefined;

  // Call this at runtime to set auth or other headers
  setApiHeaders(headers?: Record<string, string>) {
    this.API_HEADERS = headers;
  }

  // cached list for detail lookups
  private cache$ = new BehaviorSubject<any[]>([]);

  get cached() {
    return this.cache$.asObservable();
  }

  getCharacters() {
    // Debug: log API_URL being used
    // eslint-disable-next-line no-console
    console.debug('[CharacterService] API_URL=', this.API_URL);
    if (!this.API_URL) {
      // eslint-disable-next-line no-console
      console.warn('[CharacterService] No API_URL configured; returning empty list');
      return of([] as any[]);
    }

    const headers = this.API_HEADERS ? new HttpHeaders(this.API_HEADERS) : undefined;
    return this.http.get<any>(this.API_URL, { headers, observe: 'response' as const }).pipe(
      tap((resp) => {
        // debug: log full HttpResponse to help diagnose empty lists / CORS / auth
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharacters response status:', resp.status);
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharacters response headers:', resp.headers);
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharacters response body:', resp.body);
      }),
      // Pass the endpoint response body directly to callers (no JSON remapping)
      map((resp: any) => resp?.body as any),
      tap((raw) => {
        // debug: log raw API response to help diagnose empty lists
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharacters raw response:', raw);
      }),
      tap((list) => this.cache$.next(list)),
      catchError((err) => {
        // keep upstream consumers happy
        // eslint-disable-next-line no-console
        console.error('CharacterService.getCharacters error', err);
        this.cache$.next([]);
        return of([] as any[]);
      })
    );
  }

  /**
   * Fetch characters by a list of ids using the `/ids` endpoint.
   * Expects the API to accept a query parameter like `?ids=1,2,3`.
   */
  getCharactersByIds(ids: Array<string | number>) {
    if (!this.API_URL || !ids || !ids.length) return of([] as any[]);

    const base = this.API_URL.replace(/\/$/, '');
    const query = ids.map((i) => encodeURIComponent(String(i))).join(',');
    const url = `${base}/ids?ids=${query}`;
    const headers = this.API_HEADERS ? new HttpHeaders(this.API_HEADERS) : undefined;

    return this.http.get<any>(url, { headers, observe: 'response' as const }).pipe(
      tap((resp) => {
        // debug: log full HttpResponse for ids endpoint
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharactersByIds status:', resp.status, 'url:', url);
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharactersByIds body:', resp.body);
      }),
      // Pass the endpoint response body directly to callers (no JSON remapping)
      map((resp: any) => resp?.body as any),
      tap((raw) => {
        // debug: log raw API response for ids endpoint
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharactersByIds raw response:', raw, 'url:', url);
      }),
      tap((list) => {
        // merge fetched items into cache without duplicating
        const existingRaw = this.cache$.getValue();
        const existing = Array.isArray(existingRaw) ? existingRaw : [];
        const merged = existing.slice();
        for (const item of list) {
          const exists = merged.find((c) => {
            if (c.id && item.id && String(c.id) === String(item.id)) return true;
            if (c._id && item._id && String(c._id) === String(item._id)) return true;
            if (c.slug && item.slug && String(c.slug) === String(item.slug)) return true;
            return false;
          });
          if (!exists) merged.push(item);
        }
        this.cache$.next(merged);
      }),
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error('CharacterService.getCharactersByIds error', err);
        return of([] as any[]);
      })
    );
  }

  /**
   * Fetch a single character by id using `/characters/:id` endpoint.
   */
  getCharacterById(id: string | number) {
    if (!this.API_URL || id === undefined || id === null) return of(null as any);

    const base = this.API_URL.replace(/\/$/, '');
    const url = `${base}/${encodeURIComponent(String(id))}`;
    const headers = this.API_HEADERS ? new HttpHeaders(this.API_HEADERS) : undefined;

    return this.http.get<any>(url, { headers, observe: 'response' as const }).pipe(
      tap((resp) => {
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharacterById status:', resp.status, 'url:', url);
        // eslint-disable-next-line no-console
        console.debug('[CharacterService] getCharacterById body:', resp.body);
      }),
      map((resp: any) => resp?.body as any),
      tap((item) => {
        if (!item) return;
        // merge single item into cache if not already present
        const existingRaw = this.cache$.getValue();
        const existing = Array.isArray(existingRaw) ? existingRaw : [];
        const exists = existing.find((c) => {
          if (c.id && item.id && String(c.id) === String(item.id)) return true;
          if (c._id && item._id && String(c._id) === String(item._id)) return true;
          if (c.slug && item.slug && String(c.slug) === String(item.slug)) return true;
          return false;
        });
        if (!exists) this.cache$.next(existing.concat([item]));
      }),
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error('CharacterService.getCharacterById error', err);
        return of(null as any);
      })
    );
  }

  // Try to find a character by id or index in the cached list
  findCharacterById(id: string | number) {
    const list = this.cache$.getValue();
    if (!list || !list.length) return null;
    return (
      list.find((c, idx) => {
        // support several common id fields
        if (c.id && String(c.id) === String(id)) return true;
        if (c._id && String(c._id) === String(id)) return true;
        if (c.slug && String(c.slug) === String(id)) return true;
        if (String(idx) === String(id)) return true; // fallback by index
        return false;
      }) || null
    );
  }
}
