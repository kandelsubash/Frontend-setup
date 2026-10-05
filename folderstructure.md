frontend/
├── angular.json                        # Build configuration
├── package.json                        # Dependencies (locked versions)
├── tsconfig.json                       # Strict TypeScript config
├── .eslintrc.json                      # Linting + security rules
├── .prettierrc                         # Code formatting
│
├── src/
│   ├── main.ts                         # Bootstrap
│   ├── index.html                      # Shell HTML
│   ├── styles.scss                     # Global styles + PrimeNG theme
│   │
│   ├── environments/
│   │   ├── environment.ts              # Dev config (Okta, API URLs)
│   │   └── environment.prod.ts         # Prod config (no secrets!)
│   │
│   ├── app/
│   │   ├── app.component.ts            # Root component
│   │   ├── app.config.ts               # App-level providers
│   │   ├── app.routes.ts               # Top-level route definitions
│   │   │
│   │   ├── core/                       # 🔒 Singleton services (imported once)
│   │   │   ├── auth/
│   │   │   │   ├── okta-auth.config.ts     # Okta OIDC configuration
│   │   │   │   ├── auth.service.ts         # Login/logout, token access
│   │   │   │   ├── auth.guard.ts           # canActivate: is user logged in?
│   │   │   │   ├── role.guard.ts           # canActivate: does user have role?
│   │   │   │   └── auth.interceptor.ts     # Attaches Bearer token to API calls
│   │   │   ├── interceptors/
│   │   │   │   ├── error.interceptor.ts    # Global HTTP error handler
│   │   │   │   ├── loading.interceptor.ts  # Shows/hides loading spinner
│   │   │   │   └── csrf.interceptor.ts     # CSRF token handling
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts          # Base HTTP client (DRY)
│   │   │   │   ├── notification.service.ts # PrimeNG Toast wrapper
│   │   │   │   └── error-handler.service.ts
│   │   │   └── models/
│   │   │       ├── api-response.model.ts   # Generic API response type
│   │   │       └── user.model.ts           # Logged-in user model
│   │   │
│   │   ├── shared/                     # ♻️ Reusable components (imported by features)
│   │   │   ├── components/
│   │   │   │   ├── data-table/             # <app-data-table>
│   │   │   │   ├── dynamic-form/           # <app-dynamic-form>
│   │   │   │   ├── confirm-dialog/         # <app-confirm-dialog>
│   │   │   │   ├── page-header/            # <app-page-header>
│   │   │   │   ├── file-upload/            # <app-file-upload>
│   │   │   │   ├── search-bar/             # <app-search-bar>
│   │   │   │   ├── loading-overlay/        # <app-loading-overlay>
│   │   │   │   └── error-page/             # <app-error-page>
│   │   │   ├── directives/
│   │   │   │   ├── has-role.directive.ts    # *appHasRole="'ADMIN'"
│   │   │   │   └── auto-focus.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── safe-html.pipe.ts       # Sanitized HTML rendering
│   │   │   │   └── date-format.pipe.ts     # Consistent date formatting
│   │   │   └── validators/
│   │   │       └── custom-validators.ts    # Reusable form validators
│   │   │
│   │   └── features/                   # 📦 Lazy-loaded feature modules
│   │       ├── user-management/
│   │       │   ├── user-management.routes.ts
│   │       │   ├── components/
│   │       │   │   ├── user-list/
│   │       │   │   │   ├── user-list.component.ts
│   │       │   │   │   ├── user-list.component.html
│   │       │   │   │   ├── user-list.component.scss
│   │       │   │   │   └── user-list.component.spec.ts
│   │       │   │   └── user-detail/
│   │       │   ├── services/
│   │       │   │   └── user.service.ts
│   │       │   └── models/
│   │       │       └── user.model.ts
│   │       ├── order-management/           # Example: another module
│   │       ├── reporting/                  # Example: another module
│   │       └── ...
│   │
│   └── assets/
│       ├── i18n/
│       │   ├── en.json                     # English translations
│       │   └── fr.json                     # French translations (example)
│       └── images/
```