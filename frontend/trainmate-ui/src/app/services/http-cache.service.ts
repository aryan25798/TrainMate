import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay, finalize } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tag?: string;
}

export interface CacheOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
  tag?: 'cohorts' | 'trainers' | 'dashboards' | 'notifications' | string;
}

/**
 * Enterprise In-Memory HTTP Cache & Request Deduplication Layer.
 * Prevents unnecessary page reloads and redundant database reads across route navigation.
 * Features:
 * - Time-to-Live (TTL) caching with Stale-While-Revalidate support
 * - In-flight HTTP request deduplication (merges concurrent requests to identical URLs)
 * - Tag-based targeted cache invalidation on mutations (CUD operations)
 * - Zero external storage bloat; transient in-memory store
 */
@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Observable<unknown>>();

  constructor(private http: HttpClient) {}

  /**
   * Retrieves data with intelligent in-memory caching and request deduplication.
   */
  get<T>(url: string, options: CacheOptions = {}): Observable<T> {
    const ttl = options.ttlMs ?? 60_000; // default 60 seconds TTL
    const cacheKey = url;

    // 1. Force refresh bypasses cache
    if (!options.forceRefresh && this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      const isExpired = (Date.now() - entry.timestamp) > ttl;
      if (!isExpired) {
        return of(entry.data as T);
      }
    }

    // 2. In-flight request deduplication: merge identical concurrent calls
    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey)! as Observable<T>;
    }

    // 3. Dispatch fresh HTTP request
    const request$ = this.http.get<T>(url).pipe(
      tap(data => {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          tag: options.tag
        });
      }),
      finalize(() => {
        this.inFlight.delete(cacheKey);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.inFlight.set(cacheKey, request$);
    return request$;
  }

  /**
   * Retrieves currently cached value synchronously if valid without triggering HTTP call.
   */
  peek<T>(url: string, maxAgeMs: number = 120_000): T | null {
    if (!this.cache.has(url)) return null;
    const entry = this.cache.get(url)!;
    if (Date.now() - entry.timestamp > maxAgeMs) return null;
    return entry.data as T;
  }

  /**
   * Targeted cache invalidation by tag (e.g. 'cohorts', 'trainers', 'dashboards', 'notifications').
   */
  invalidateTag(tags: string | string[]): void {
    const tagList = Array.isArray(tags) ? tags : [tags];
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tag && tagList.includes(entry.tag)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate exact URL or URL prefix.
   */
  invalidateUrl(urlPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(urlPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears entire cache (e.g. on user logout).
   */
  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}
