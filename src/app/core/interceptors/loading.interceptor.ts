import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/** HttpContextToken allowing specific background requests to bypass the global loading spinner. */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/**
 * Functional interceptor to automatically increment/decrement active request count
 * in LoadingService for global spinner presentation.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    }),
  );
};
