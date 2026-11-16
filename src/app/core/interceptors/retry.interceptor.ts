import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

export const MAX_RETRIES = 2;
export const RETRY_DELAY_MS = 500;

/** Network errors (status 0) and server errors (5xx) are worth retrying; 4xx are not. */
export function shouldRetry(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}

/**
 * Retries failed GET requests up to 2 times, waiting a bit longer each time
 * (500ms, then 1000ms). Write requests are never retried to avoid duplicates.
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, attempt) =>
        shouldRetry(error) ? timer(attempt * RETRY_DELAY_MS) : throwError(() => error),
    }),
  );
};
