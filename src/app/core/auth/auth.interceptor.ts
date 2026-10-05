import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { environment } from '../../../environments/environment';

/**
 * Validates whether the target request URL belongs to an allow-listed API origin.
 * Prevents Bearer token leakage to external third-party servers (SEC-13).
 */
function isAllowedOrigin(url: string): boolean {
  if (url.startsWith(environment.apiBaseUrl) || url.startsWith('/')) {
    return true;
  }
  return environment.allowedOrigins.some((origin) => url.startsWith(origin));
}

/**
 * Authentication interceptor attaching Okta Bearer access token to authorized outgoing requests.
 * SEC-13 / SEC-14 compliant: token is attached only to trusted origins.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isAllowedOrigin(req.url)) {
    return next(req);
  }

  const oktaAuth = inject(OKTA_AUTH);
  const token = oktaAuth.getAccessToken();

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(req);
};
