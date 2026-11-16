import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

/** Simple in-memory cache for GET responses, keyed by URL. */
@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  readonly ttlMs = 60_000;
  private readonly entries = new Map<string, CacheEntry>();

  get(url: string): HttpResponse<unknown> | null {
    const entry = this.entries.get(url);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(url);
      return null;
    }
    return entry.response;
  }

  set(url: string, response: HttpResponse<unknown>): void {
    this.entries.set(url, { response, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.entries.clear();
  }
}
