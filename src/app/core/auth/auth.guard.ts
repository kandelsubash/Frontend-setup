import { inject } from '@angular/core';
import { CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { environment } from '../../../environments/environment';

/**
 * Route guard checking whether the current user is authenticated via Okta.
 * If not authenticated, redirects the user to Okta login while preserving destination URL.
 */
export const authGuard: CanActivateFn = async (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  // If authentication is explicitly bypassed in environment, allow navigation immediately
  if (environment.bypassAuth) {
    return true;
  }

  // If running with development placeholder Okta domain, bypass redirect to avoid unresolvable fetch calls
  if (environment.okta.issuer.includes('dev-example.okta.com')) {
    console.info(
      '[OktaAuth] Placeholder Okta issuer detected (dev-example.okta.com). Configure your real Okta domain in environment.ts to enable authentication redirects.',
    );
    return true;
  }

  const oktaAuth = inject(OKTA_AUTH);

  try {
    const isAuthenticated = await oktaAuth.isAuthenticated();

    if (isAuthenticated) {
      return true;
    }

    // Preserve the intended target URL for seamless post-login navigation
    oktaAuth.setOriginalUri(state.url);
    await oktaAuth.signInWithRedirect();
    return false;
  } catch (error) {
    console.warn('[OktaAuth] Authentication check failed:', error);
    return false;
  }
};
