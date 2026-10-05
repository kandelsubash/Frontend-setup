import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { provideOktaAuth, withOktaConfig } from '@okta/okta-angular';

import { routes } from './app.routes';
import { oktaAuth } from '@core/auth/okta-auth.config';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { csrfInterceptor } from '@core/interceptors/csrf.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { apiResponseInterceptor } from '@core/interceptors/api-response.interceptor';
import { GlobalErrorHandlerService } from '@core/services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        csrfInterceptor,
        loadingInterceptor,
        errorInterceptor,
        apiResponseInterceptor,
      ]),
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideOktaAuth(
      withOktaConfig({
        oktaAuth,
      }),
    ),
    MessageService,
    ConfirmationService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
  ],
};
