# Template: API Service (Base HTTP Client)

## Purpose
Centralized HTTP service that all feature services inject. It is the ONLY place `HttpClient` is used for
backend calls.

- Unwraps the `ApiResponse<T>` envelope and returns `T`.
- Messaging (success/error toasts) is NOT done here and NOT in components. It is done globally by
  `apiResponseInterceptor`, so every feature service behaves identically.
- Authentication is by Bearer token added by `authInterceptor` (Okta SPA flow). This service does not set
  `withCredentials` and never touches tokens.

## Code

```typescript
// src/app/core/services/api.service.ts
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SKIP_API_MESSAGES } from '../interceptors/api-response.interceptor';
import { ApiResponse } from '../models/api-response.model';

type ParamValue = string | number | boolean;

export interface ApiRequestOptions {
  params?: HttpParams | Record<string, ParamValue | readonly ParamValue[]>;
  /** Suppress automatic toasts for this call (polling, health checks). Errors are still thrown. */
  silent?: boolean;
}

/**
 * Base API service. All backend HTTP calls go through this service.
 *
 * Behavior:
 * - Returns the unwrapped `data` payload. Message-only responses (save/update/delete) emit `undefined`,
 *   so use `Observable<void>` for those.
 * - Success/error messages are produced by apiResponseInterceptor. Do not add messaging here.
 * - success=false responses arrive as errors (converted by the interceptor), never as data.
 *
 * Security:
 * - Base URL from environment, never hardcoded (SEC-02)
 * - Bearer token attached by authInterceptor for allow-listed origins (SEC-13). No withCredentials
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** GET: retrieval. Never shows a success toast. */
  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /** POST: use T = void for message-only responses (save) */
  post<T = void>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', path, body, options);
  }

  /** PUT: use T = void for message-only responses (update) */
  put<T = void>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PUT', path, body, options);
  }

  /** PATCH: use T = void for message-only responses (partial update) */
  patch<T = void>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  /** DELETE: use T = void for message-only responses */
  delete<T = void>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private request<T>(
    method: string,
    path: string,
    body: unknown,
    options: ApiRequestOptions = {},
  ): Observable<T> {
    const context = new HttpContext().set(SKIP_API_MESSAGES, options.silent ?? false);

    return this.http
      .request<ApiResponse<T>>(method, this.buildUrl(path), {
        body,
        params: options.params,
        context,
      })
      .pipe(map((response) => response.data as T));
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }
}
```

## Feature Service Usage

```typescript
// src/app/features/users/user.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { User, UserForm } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(): Observable<User[]> {
    return this.api.get<User[]>('users');                    // data present -> no toast
  }

  save(form: UserForm): Observable<void> {
    return this.api.post('users', form);                     // message-only -> success toast (automatic)
  }

  update(id: string, form: UserForm): Observable<void> {
    return this.api.put(`users/${id}`, form);                // message-only -> success toast (automatic)
  }

  remove(id: string): Observable<void> {
    return this.api.delete(`users/${id}`);                   // message-only -> success toast (automatic)
  }
}
```

Rules for feature services and components:
- Inject `ApiService`, never `HttpClient`.
- Never inject `MessageService` for API results.
- Components subscribe only for state changes (navigate, reload, reset loading flags). The `error` callback must not show messages.

## Optional Lint Guard
Keeps every service on the same messaging path.

```javascript
// eslint.config.js (excerpt)
{
  files: ['src/app/features/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        { name: '@angular/common/http', importNames: ['HttpClient'], message: 'Use ApiService.' },
        { name: 'primeng/api', importNames: ['MessageService'], message: 'API messages are handled by apiResponseInterceptor.' },
      ],
    }],
  },
}
```
Non-API toasts (e.g. "Copied to clipboard") need an explicit exception for that file.

## Security Rules Enforced
- SEC-02: Base URL from environment, never hardcoded
- SEC-13: Access token is attached only by `authInterceptor` to allow-listed origins. This service never handles tokens
- SEC-14: Authentication is by Bearer header. `withCredentials` is not used (changed from the cookie version, update your rule registry)
