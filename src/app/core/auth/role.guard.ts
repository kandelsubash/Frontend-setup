import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Route guard checking whether the authenticated user possesses the role required by route data.
 * Redirects unauthorized users to /forbidden.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles: readonly string[] = (route.data['roles'] as string[] | undefined) ?? [
    route.data['role'] as string,
  ].filter(Boolean);

  if (expectedRoles.length === 0) {
    return true;
  }

  const hasRole = authService.hasAnyRole(expectedRoles);
  if (hasRole) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};
