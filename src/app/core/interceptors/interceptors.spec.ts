import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../services/notification.service';
import { cacheInterceptor } from './cache.interceptor';
import { errorInterceptor, getErrorKey } from './error.interceptor';
import { HttpCacheService } from './http-cache.service';
import { retryInterceptor, shouldRetry } from './retry.interceptor';

describe('HTTP interceptors', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const notification = { error: vi.fn(), success: vi.fn() };

  beforeEach(() => {
    notification.error.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor, cacheInterceptor, retryInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  describe('cache', () => {
    it('returns the cached response for the same GET', () => {
      const results: unknown[] = [];
      http.get('api/tasks').subscribe((r) => results.push(r));
      httpMock.expectOne('api/tasks').flush([1]);

      http.get('api/tasks').subscribe((r) => results.push(r));
      httpMock.expectNone('api/tasks');
      expect(results).toEqual([[1], [1]]);
    });

    it('clears the cache after a write request', () => {
      http.get('api/tasks').subscribe();
      httpMock.expectOne('api/tasks').flush([1]);

      http.delete('api/tasks/1').subscribe();
      httpMock.expectOne('api/tasks/1').flush(null);

      http.get('api/tasks').subscribe();
      httpMock.expectOne('api/tasks').flush([]);
    });

    it('expires entries after the TTL', () => {
      vi.useFakeTimers();
      const cache = TestBed.inject(HttpCacheService);
      http.get('api/users').subscribe();
      httpMock.expectOne('api/users').flush([]);

      vi.advanceTimersByTime(cache.ttlMs + 1);
      expect(cache.get('api/users')).toBeNull();
    });
  });

  describe('retry', () => {
    it('retries server errors twice before failing', () => {
      vi.useFakeTimers();
      let error: HttpErrorResponse | undefined;
      http.get('api/tasks').subscribe({ error: (e) => (error = e) });

      httpMock.expectOne('api/tasks').flush(null, { status: 500, statusText: 'Error' });
      vi.advanceTimersByTime(500);
      httpMock.expectOne('api/tasks').flush(null, { status: 500, statusText: 'Error' });
      vi.advanceTimersByTime(1000);
      httpMock.expectOne('api/tasks').flush(null, { status: 500, statusText: 'Error' });

      expect(error?.status).toBe(500);
      expect(notification.error).toHaveBeenCalledWith('errors.server');
    });

    it('does not retry client errors or write requests', () => {
      http.get('api/missing').subscribe({ error: () => undefined });
      httpMock.expectOne('api/missing').flush(null, { status: 404, statusText: 'Not Found' });

      http.post('api/tasks', {}).subscribe({ error: () => undefined });
      httpMock.expectOne('api/tasks').flush(null, { status: 500, statusText: 'Error' });
      expect(notification.error).toHaveBeenCalledTimes(2);
    });

    it('shouldRetry only accepts network and 5xx errors', () => {
      expect(shouldRetry(new HttpErrorResponse({ status: 0 }))).toBe(true);
      expect(shouldRetry(new HttpErrorResponse({ status: 503 }))).toBe(true);
      expect(shouldRetry(new HttpErrorResponse({ status: 400 }))).toBe(false);
      expect(shouldRetry(new Error('x'))).toBe(false);
    });
  });

  it('getErrorKey picks a message for each status', () => {
    expect(getErrorKey(new HttpErrorResponse({ status: 0 }))).toBe('errors.network');
    expect(getErrorKey(new HttpErrorResponse({ status: 404 }))).toBe('errors.notFound');
    expect(getErrorKey(new HttpErrorResponse({ status: 500 }))).toBe('errors.server');
    expect(getErrorKey(new HttpErrorResponse({ status: 422 }))).toBe('errors.generic');
  });
});
