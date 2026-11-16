import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { HttpCacheService } from './http-cache.service';

/**
 * Caches GET responses for a short time.
 * Any write request (POST/PUT/DELETE) clears the cache so we never show stale data.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(HttpCacheService);

  if (req.method !== 'GET') {
    cache.clear();
    return next(req);
  }

  const cached = cache.get(req.urlWithParams);
  if (cached) {
    return of(cached.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, event);
      }
    }),
  );
};
