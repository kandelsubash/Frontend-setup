import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Global HTTP error interceptor.
 * Catches unhandled HTTP status codes (e.g. 401 Unauthorized, 403 Forbidden) and coordinates redirects.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          // Token expired or invalid: navigate to login or trigger re-auth
          router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden resource
          router.navigate(['/forbidden']);
        }
      }
      return throwError(() => error);
    }),
  );
};
