import { Routes } from '@angular/router';
import { OktaCallbackComponent } from '@okta/okta-angular';
import { authGuard } from '@core/auth/auth.guard';
import { AppErrorPageComponent } from '@shared/components/error-page/error-page.component';

/**
 * Top-level application routing table.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'login/callback',
    component: OktaCallbackComponent,
  },
  {
    path: 'forbidden',
    component: AppErrorPageComponent,
    data: {
      code: '403',
      title: 'Access Forbidden',
      message: 'You do not have permission to access the requested resource.',
    },
  },
  
  {
    path: '**',
    component: AppErrorPageComponent,
    data: {
      code: '404',
      title: 'Page Not Found',
      message: 'The requested page does not exist.',
    },
  },
];
