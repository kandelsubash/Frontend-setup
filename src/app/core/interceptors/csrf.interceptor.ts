import { HttpInterceptorFn } from '@angular/common/http';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

/**
 * Reads a cookie value by name from document.cookie safely.
 * @param name Cookie name to search for.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match && match[3] ? decodeURIComponent(match[3]) : null;
}

/**
 * SEC-03 compliant: CSRF protection interceptor.
 * Automatically adds the X-XSRF-TOKEN header on mutating requests when the CSRF cookie exists.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MUTATING_METHODS.has(req.method)) {
    return next(req);
  }

  const token = getCookie(CSRF_COOKIE_NAME);
  if (token && !req.headers.has(CSRF_HEADER_NAME)) {
    const cloned = req.clone({
      headers: req.headers.set(CSRF_HEADER_NAME, token),
    });
    return next(cloned);
  }

  return next(req);
};
