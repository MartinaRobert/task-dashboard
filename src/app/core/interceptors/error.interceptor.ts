import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/** Turns an HTTP error into a translation key the user can understand. */
export function getErrorKey(error: HttpErrorResponse): string {
  if (error.status === 0) return 'errors.network';
  if (error.status === 404) return 'errors.notFound';
  if (error.status >= 500) return 'errors.server';
  return 'errors.generic';
}

/** Shows a snackbar for every failed request, then passes the error on. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notification.error(getErrorKey(error));
      return throwError(() => error);
    }),
  );
};
