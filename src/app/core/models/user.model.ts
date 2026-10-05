/**
 * Authenticated user profile representation mapped from Okta ID token / user claims.
 */
export interface User {
  /** Unique user identifier (sub claim). */
  id: string;
  /** Primary user email address. */
  email: string;
  /** Full display name. */
  name: string;
  /** Given/first name. */
  firstName?: string;
  /** Family/last name. */
  lastName?: string;
  /** User login handle / username. */
  username: string;
  /** Assigned roles or group memberships from Okta claims. */
  roles: readonly string[];
  /** Email verified indicator. */
  emailVerified?: boolean;
}
