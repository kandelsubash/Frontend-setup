# Template: API Response Interceptor

## Purpose
Single place for ALL user-facing API messaging. Components and feature services never call
`MessageService` for API results.

Handles the standardized backend envelope `{ data, timestamp, responsecode, message, success }`:

1. **Success, message only (no `data`)** on a mutating call (POST/PUT/PATCH/DELETE) -> shows the response `message` as a success toast automatically.
   Responses that carry `data` (retrieval) never show a success toast.
2. **Error** (HTTP error, network error, or `success=false` even on HTTP 200) -> shows an error toast automatically:
   1. the `message` from the response, if present
   2. else a default message for the `responsecode` (e.g. `500` -> "Internal server error")
   3. else a default message for the HTTP status
   4. else a generic fallback
3. Errors are still re-thrown so components can stop spinners / reset state. Components must NOT show messages.

Every feature service goes through `ApiService` (HttpClient), so every API call behaves identically.

## Code

```typescript
// src/app/core/interceptors/api-response.interceptor.ts
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
 * SEC-02 compliant: API origin comes from the environment, nothing hardcoded.
 * Only requests to the API base URL are handled. Assets, i18n files and third-party
 * calls pass through untouched.
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) return next(req);

  const messages = inject(ApiMessageService);
  const silent = req.context.get(SKIP_API_MESSAGES);

  return next(req).pipe(
    mergeMap((event): Observable<HttpEvent<unknown>> => {
      if (!(event instanceof HttpResponse) || !isApiResponse(event.body)) return of(event);
      const body = event.body;

      // success=false on HTTP 200: treat as an error. Toast is shown once, in catchError below.
      if (!body.success) {
        return throwError(() => new HttpErrorResponse({
          error: body,
          status: event.status,
          statusText: event.statusText,
          url: event.url ?? undefined,
          headers: event.headers,
        }));
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
      // 401 is handled by the unauthorized interceptor (re-login redirect). No toast.
      if (!silent && status !== 401) {
        messages.error(resolveErrorMessage(error), status > 0 ? `Error ${status}` : 'Error');
      }
      return throwError(() => error);
    }),
  );
};

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return typeof body === 'object' && body !== null
    && typeof (body as { success?: unknown }).success === 'boolean';
}

/** Only plain, non-empty string messages are used. Capped in length. Rendered as text, never HTML. */
function readMessage(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null;
  const message = (body as { message?: unknown }).message;
  if (typeof message !== 'string') return null;
  const trimmed = message.trim();
  return trimmed ? trimmed.slice(0, MAX_MESSAGE_LENGTH) : null;
}

function resolveErrorMessage(error: unknown): string {
  const httpError = error instanceof HttpErrorResponse ? error : null;
  const body: unknown = httpError?.error;   // may be the envelope, a string, HTML or a Blob

  // 1. message supplied by the backend
  const fromResponse = readMessage(body);
  if (fromResponse) return fromResponse;

  // 2. default for the responsecode, 3. default for the HTTP status
  const rawCode = typeof body === 'object' && body !== null
    ? (body as { responsecode?: unknown }).responsecode
    : undefined;
  const code = rawCode != null ? String(rawCode) : undefined;

  if (code && RESPONSE_CODE_MESSAGES[code]) return RESPONSE_CODE_MESSAGES[code];
  if (httpError && RESPONSE_CODE_MESSAGES[String(httpError.status)]) {
    return RESPONSE_CODE_MESSAGES[String(httpError.status)];
  }

  // 4. fallback
  return code ? `Operation failed (Code: ${code})` : DEFAULT_ERROR_MESSAGE;
}
```

## API Message Service

```typescript
// src/app/core/services/api-message.service.ts
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

const SUCCESS_LIFE_MS = 4000;
const ERROR_LIFE_MS = 6000;
const DEDUPE_WINDOW_MS = 1500;

/**
 * The only class that talks to PrimeNG MessageService for API results.
 * Suppresses identical toasts fired within a short window (e.g. several parallel calls failing at once).
 */
@Injectable({ providedIn: 'root' })
export class ApiMessageService {
  private readonly messageService = inject(MessageService);
  private last = { key: '', at: 0 };

  success(detail: string): void {
    this.show('success', 'Success', detail, SUCCESS_LIFE_MS);
  }

  error(detail: string, summary = 'Error'): void {
    this.show('error', summary, detail, ERROR_LIFE_MS);
  }

  private show(severity: 'success' | 'error', summary: string, detail: string, life: number): void {
    const key = `${severity}|${detail}`;
    const now = Date.now();
    if (key === this.last.key && now - this.last.at < DEDUPE_WINDOW_MS) return;
    this.last = { key, at: now };
    this.messageService.add({ severity, summary, detail, life });
  }
}
```

## API Response Model

```typescript
// src/app/core/models/api-response.model.ts
export interface ApiResponse<T> {
  data?: T | null;      // absent/null on message-only responses (save, update, delete)
  timestamp: string;
  responsecode: string;
  message: string;
  success: boolean;
}
```

## Default Error Messages

```typescript
// src/app/core/models/api-error-messages.ts
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';

/**
 * Used only when the backend response has NO message.
 * Keys are strings so backend-specific codes can be added next to HTTP codes.
 */
export const RESPONSE_CODE_MESSAGES: Readonly<Record<string, string>> = {
  '0':   'Unable to reach the server. Check your connection and try again.',
  '400': 'Invalid request. Please check your input.',
  '403': 'You do not have permission to perform this action.',
  '404': 'The requested resource was not found.',
  '405': 'This action is not allowed.',
  '408': 'The request timed out. Please try again.',
  '409': 'This action conflicts with existing data.',
  '413': 'The submitted data is too large.',
  '415': 'Unsupported data format.',
  '422': 'The submitted data could not be processed.',
  '429': 'Too many requests. Please wait and try again.',
  '500': 'Internal server error. Please try again later.',
  '502': 'The server is temporarily unavailable. Please try again later.',
  '503': 'The service is currently unavailable. Please try again later.',
  '504': 'The server took too long to respond. Please try again.',
  // Add backend-specific codes here, e.g. 'USR_001': 'User already exists.'
};
```

## Registration

```typescript
// src/app/app.config.ts
import { MessageService } from 'primeng/api';

providers: [
  MessageService,   // required by ApiMessageService
  provideHttpClient(withInterceptors([
    authInterceptor,          // adds Bearer token
    unauthorizedInterceptor,  // 401 -> re-login, 403 -> /forbidden
    apiResponseInterceptor,   // LAST = innermost: sees raw errors first, toasts, re-throws
  ])),
  // ...
]
```

Add one global `<p-toast />` to the root component template.

Notes:
- With Okta SPA auth (Bearer header) there are no auth cookies, so `csrfInterceptor` is not needed for this flow. Keep it only if another cookie-based endpoint still requires it, and keep it before `apiResponseInterceptor`.
- The interceptor does NOT unwrap `data`. Unwrapping is done once in `ApiService`.

## Behavior Matrix

| Response | Toast | Observable result |
|----------|-------|-------------------|
| 200, `success=true`, `data` present (GET, or any call) | none | emits response |
| 200, `success=true`, no `data`, `message` present, POST/PUT/PATCH/DELETE | success: `message` | emits response |
| 200, `success=true`, no `data`, GET | none | emits response |
| 200, `success=false`, `message` present | error: `message` | errors |
| 200, `success=false`, no message, `responsecode` "500" | error: "Internal server error..." | errors |
| 4xx/5xx with envelope containing `message` | error: `message` | errors |
| 4xx/5xx, no usable body (HTML, string, Blob) | error: default for `responsecode`, else for status | errors |
| Network failure (status 0) | error: "Unable to reach the server..." | errors |
| 401 | none (unauthorized interceptor re-authenticates) | errors |
| Request has `SKIP_API_MESSAGES=true` | none | same as above |
| URL not under `apiBaseUrl` | none | untouched |

## Component Usage (no messaging code)

```typescript
// Correct: the component only reacts to state. Toasts are already handled.
save(): void {
  this.saving.set(true);
  this.userService.save(this.form.value).subscribe({
    next: () => this.router.navigate(['/users']),
    error: () => this.saving.set(false),   // NO messageService here
  });
}
```

## Backend Contract
- Always return the envelope on success and on handled errors.
- Message-only operations (save/update/delete): return `success: true`, `message`, and omit `data` (or `null`).
- Retrieval: return `data`. Do not rely on a success toast.
- Errors: set `success: false`, a user-safe `message` if one should be shown, and a `responsecode`. Never put stack traces or internals in `message`.

## Security Rules Enforced
- SEC-02: API origin from environment, no hardcoded URLs or secrets
- SEC-18 (new): Only string messages are shown, trimmed and length-capped, rendered as text (never HTML). Raw error bodies, HTML or stack traces are never displayed. No tokens or request payloads in messages or logs

## Anti-Patterns (Reject in Review)
- Calling `MessageService` from a component or feature service for API success/error
- `catchError` in a component that shows its own toast
- Injecting `HttpClient` in a feature service instead of `ApiService`
- Showing success toasts for GET requests
- Parsing `error.error.message` in components
