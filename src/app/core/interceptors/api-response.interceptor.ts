import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiMessageService } from '../services/api-message.service';
import { DEFAULT_ERROR_MESSAGE, RESPONSE_CODE_MESSAGES } from '../models/api-error-messages';

/** Per-request opt-out of toasts (polling, health checks). Errors are still thrown. */
export const SKIP_API_MESSAGES = new HttpContextToken<boolean>(() => false);

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_MESSAGE_LENGTH = 300;

/**
 * SEC-02 compliant: API origin comes from environment, nothing hardcoded.
 * Handles standardized envelope { data, timestamp, responsecode, message, success }.
 * Only requests targeting the API base URL are handled.
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const messages = inject(ApiMessageService);
  const silent = req.context.get(SKIP_API_MESSAGES);

  return next(req).pipe(
    mergeMap((event): Observable<HttpEvent<unknown>> => {
      if (!(event instanceof HttpResponse) || !isApiResponse(event.body)) {
        return of(event);
      }
      const body = event.body;

      // success=false on HTTP 200: treat as an error; toast is shown once in catchError below.
      if (!body.success) {
        return throwError(
          () =>
            new HttpErrorResponse({
              error: body,
              status: event.status,
              statusText: event.statusText,
              url: event.url ?? undefined,
              headers: event.headers,
            }),
        );
      }

      // success=true: toast ONLY for mutating calls whose response has a message but no data.
      const message = readMessage(body);
      if (!silent && message && MUTATING_METHODS.has(req.method) && body.data == null) {
        messages.success(message);
      }
      return of(event);
    }),

    catchError((error: unknown) => {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      // 401 is handled by unauthorized logic / re-login redirect, so suppress normal toast
      if (!silent && status !== 401) {
        messages.error(resolveErrorMessage(error), status > 0 ? `Error ${status}` : 'Error');
      }
      return throwError(() => error);
    }),
  );
};

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { success?: unknown }).success === 'boolean'
  );
}

/** Only plain, non-empty string messages are used. Capped in length. Rendered as text, never HTML (SEC-18). */
function readMessage(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const message = (body as { message?: unknown }).message;
  if (typeof message !== 'string') {
    return null;
  }
  const trimmed = message.trim();
  return trimmed ? trimmed.slice(0, MAX_MESSAGE_LENGTH) : null;
}

function resolveErrorMessage(error: unknown): string {
  const httpError = error instanceof HttpErrorResponse ? error : null;
  const body: unknown = httpError?.error;

  // 1. Message supplied by backend envelope
  const fromResponse = readMessage(body);
  if (fromResponse) {
    return fromResponse;
  }

  // 2. Default for responsecode, 3. Default for HTTP status
  const rawCode =
    typeof body === 'object' && body !== null
      ? (body as { responsecode?: unknown }).responsecode
      : undefined;
  const code = rawCode != null ? String(rawCode) : undefined;

  if (code && RESPONSE_CODE_MESSAGES[code]) {
    return RESPONSE_CODE_MESSAGES[code];
  }
  if (httpError && RESPONSE_CODE_MESSAGES[String(httpError.status)]) {
    return RESPONSE_CODE_MESSAGES[String(httpError.status)];
  }

  // 4. Generic fallback
  return code ? `Operation failed (Code: ${code})` : DEFAULT_ERROR_MESSAGE;
}
