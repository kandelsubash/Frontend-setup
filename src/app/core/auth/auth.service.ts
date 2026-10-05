import { Injectable, inject, signal } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { UserClaims } from '@okta/okta-auth-js';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

/**
 * Mock user provided when Okta authentication is bypassed in local development.
 */
const MOCK_AUTH_USER: User = {
  id: 'cotiviti-admin-001',
  email: 'admin@cotiviti.com',
  name: 'Cotiviti Admin',
  firstName: 'Cotiviti',
  lastName: 'Admin',
  username: 'cotiviti.admin',
  roles: ['ADMIN', 'USER', 'ANALYST'],
  emailVerified: true,
};

/**
 * Authentication facade integrating Okta SDK with Angular Signals.
 * Exposes reactive signals for authentication status, active user profile, and role validation.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oktaAuth = inject(OKTA_AUTH, { optional: true });
  private readonly authStateService = inject(OktaAuthStateService, { optional: true });

  /** Signal reflecting current authentication status. */
  readonly isAuthenticated = signal<boolean>(environment.bypassAuth);

  /** Signal reflecting current authenticated user profile. */
  readonly currentUser = signal<User | null>(environment.bypassAuth ? MOCK_AUTH_USER : null);

  constructor() {
    if (environment.bypassAuth || !this.authStateService) {
      return;
    }

    this.authStateService.authState$.subscribe({
      next: (authState) => {
        const authenticated = !!authState?.isAuthenticated;
        this.isAuthenticated.set(authenticated);

        if (authenticated && authState.idToken?.claims) {
          this.currentUser.set(this.mapClaimsToUser(authState.idToken.claims));
        } else {
          this.currentUser.set(null);
        }
      },
      error: (err: unknown) => {
        console.warn('[AuthService] Okta authState error:', err);
      },
    });
  }

  /**
   * Initiates Okta PKCE redirect sign-in flow.
   * @param originalUrl Optional return URL after successful authentication.
   */
  async login(originalUrl?: string): Promise<void> {
    if (environment.bypassAuth || !this.oktaAuth) {
      this.isAuthenticated.set(true);
      this.currentUser.set(MOCK_AUTH_USER);
      return;
    }

    if (originalUrl) {
      this.oktaAuth.setOriginalUri(originalUrl);
    }
    await this.oktaAuth.signInWithRedirect();
  }

  /**
   * Terminates active session and resets state.
   */
  async logout(): Promise<void> {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);

    if (!environment.bypassAuth && this.oktaAuth) {
      await this.oktaAuth.signOut();
    }
  }

  /**
   * Retrieves active access token string.
   */
  getAccessToken(): string | undefined {
    return this.oktaAuth?.getAccessToken();
  }

  /**
   * Retrieves active ID token string.
   */
  getIdToken(): string | undefined {
    return this.oktaAuth?.getIdToken();
  }

  /**
   * Checks whether the current user has the specified role or group membership.
   * @param role Target role name.
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return !!user && user.roles.includes(role);
  }

  /**
   * Checks whether the current user possesses any of the specified roles.
   * @param roles Array of role names.
   */
  hasAnyRole(roles: readonly string[]): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    return roles.some((role) => user.roles.includes(role));
  }

  /**
   * Checks whether the current user possesses all specified roles.
   * @param roles Array of role names.
   */
  hasAllRoles(roles: readonly string[]): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    return roles.every((role) => user.roles.includes(role));
  }

  private mapClaimsToUser(claims: UserClaims): User {
    const rawGroups: unknown = claims['groups'] ?? claims['roles'] ?? [];
    const roles: string[] = Array.isArray(rawGroups)
      ? rawGroups.filter((g): g is string => typeof g === 'string')
      : [];

    return {
      id: claims.sub,
      email: claims.email ?? '',
      name: claims.name ?? '',
      firstName: typeof claims['given_name'] === 'string' ? claims['given_name'] : undefined,
      lastName: typeof claims['family_name'] === 'string' ? claims['family_name'] : undefined,
      username: claims.preferred_username ?? claims.email ?? claims.sub,
      roles,
      emailVerified: claims['email_verified'] === true,
    };
  }
}
