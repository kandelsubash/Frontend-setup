import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import { environment } from '../../../environments/environment';

/**
 * Standard Okta OIDC/PKCE configuration.
 * SEC-02 compliant: all endpoints and client IDs are driven by environment.
 * SEC-13 compliant: tokens are stored in memory to avoid localStorage / sessionStorage vulnerability.
 */
export const oktaAuthOptions: OktaAuthOptions = {
  issuer: environment.okta.issuer,
  clientId: environment.okta.clientId,
  redirectUri: environment.okta.redirectUri,
  postLogoutRedirectUri: environment.okta.postLogoutRedirectUri,
  scopes: environment.okta.scopes,
  pkce: environment.okta.pkce,
  tokenManager: {
    storage: 'memory',
    autoRenew: true,
    expireEarlySeconds: 30,
  },
};

/**
 * Singleton instance of OktaAuth configured for the enterprise application.
 */
export const oktaAuth = new OktaAuth(oktaAuthOptions);
