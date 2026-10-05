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
  /** Suppress automatic toasts for this call (e.g., polling, health checks). Errors are still thrown. */
  silent?: boolean;
}

/**
 * Base API service. All backend HTTP calls go through this service.
 *
 * Behavior:
 * - Returns the unwrapped data payload. Message-only responses (save/update/delete) emit undefined.
 * - Success/error toasts are handled globally by apiResponseInterceptor.
 * - Authentication Bearer token is attached by authInterceptor for allowed origins (SEC-13, SEC-14).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Performs an HTTP GET request to retrieve data. Never displays a success toast.
   * @param path API endpoint relative to base URL.
   * @param options Request options including query params and toast suppression.
   */
  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Performs an HTTP POST request. Use T = void for message-only operations.
   * @param path API endpoint.
   * @param body Request body payload.
   * @param options Optional request options.
   */
  post<T = void>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * Performs an HTTP PUT request. Use T = void for message-only operations.
   * @param path API endpoint.
   * @param body Request body payload.
   * @param options Optional request options.
   */
  put<T = void>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * Performs an HTTP PATCH request. Use T = void for message-only operations.
   * @param path API endpoint.
   * @param body Request body payload.
   * @param options Optional request options.
   */
  patch<T = void>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * Performs an HTTP DELETE request. Use T = void for message-only operations.
   * @param path API endpoint.
   * @param options Optional request options.
   */
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
