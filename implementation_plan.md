# Implementation Plan: Angular 22+ & PrimeNG 22+ Enterprise Project Setup

Set up a production-ready, zero-defect enterprise Angular 22+ application with PrimeNG 22+, Okta authentication SDK integration, centralized core services, global API response interceptors, and strict security compliance strictly inside `C:\Users\dell\Desktop\Legacy-to-modern\project-setup\frontend`.

## User Review Required

> [!IMPORTANT]
> - **Target Directory**: The Angular project will be created in `C:\Users\dell\Desktop\Legacy-to-modern\project-setup\frontend` according to `folderstructure.md`. No files or directories outside `project-setup` will be touched.
> - **Angular 22+ & PrimeNG 22+**: Utilizing the latest stable versions from npm (`@angular/core: 22.2.1`, `primeng: 22.1.2`, `@primeng/themes: 21.0.4`, `primeicons: 8.0.2`, `@okta/okta-angular: 8.0.0`, `@okta/okta-auth-js: 8.0.1`).
> - **Scope Boundary**: As specified, this is strictly project setup—no business feature components will be created. Feature folders will include directory placeholders and lazy routing skeletons matching `folderstructure.md`.
> - **Security Baseline**: Enforces all 14 security rules (SEC-01 through SEC-14) plus SEC-18 (safe message rendering), strict TypeScript (`strict: true`, zero `any`), standalone components, OnPush change detection, Signals, and `inject()` DI.

## Architecture & Directory Layout

The project structure inside `C:\Users\dell\Desktop\Legacy-to-modern\project-setup\frontend`:

```
frontend/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── .prettierrc
├── .editorconfig
├── src/
│   ├── main.ts
│   ├── index.html                      # Strict CSP (SEC-06)
│   ├── styles.scss                     # PrimeNG theme + PrimeIcons
│   ├── environments/
│   │   ├── environment.ts              # Development configuration (Okta, API base URL)
│   │   └── environment.prod.ts         # Production configuration (placeholders, no secrets)
│   ├── app/
│   │   ├── app.component.ts            # Root component with <p-toast />, <p-confirmDialog />
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts               # Providers, PrimeNG theme, Okta auth, interceptors
│   │   ├── app.routes.ts               # Top-level routes (OktaCallbackComponent, guards)
│   │   │
│   │   ├── core/                       # 🔒 Singleton infrastructure
│   │   │   ├── auth/
│   │   │   │   ├── okta-auth.config.ts # Okta OIDC configuration (PKCE, scopes)
│   │   │   │   ├── auth.service.ts     # Auth facade using Okta SDK with Signals
│   │   │   │   ├── auth.guard.ts       # canActivateFn route guard
│   │   │   │   ├── role.guard.ts       # canActivateFn role/claim check guard
│   │   │   │   └── auth.interceptor.ts # Attaches Bearer token to allowedOrigins (SEC-13, SEC-14)
│   │   │   ├── interceptors/
│   │   │   │   ├── api-response.interceptor.ts # Envelope handling & global toast messaging
│   │   │   │   ├── error.interceptor.ts        # Global unhandled HTTP error handler
│   │   │   │   ├── loading.interceptor.ts      # HTTP activity tracker
│   │   │   │   └── csrf.interceptor.ts         # Double-submit cookie handler
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts          # Centralized ApiService unwrapping ApiResponse<T>
│   │   │   │   ├── api-message.service.ts  # PrimeNG MessageService wrapper with de-duplication
│   │   │   │   ├── notification.service.ts # High-level toast/alert notification service
│   │   │   │   ├── error-handler.service.ts# Global Angular ErrorHandler
│   │   │   │   └── loading.service.ts      # Signal-based loading manager
│   │   │   └── models/
│   │   │       ├── api-response.model.ts   # Generic { data, timestamp, responsecode, message, success }
│   │   │       ├── api-error-messages.ts   # Standard HTTP and response code message mappings
│   │   │       └── user.model.ts           # Authenticated user representation
│   │   │
│   │   ├── shared/                     # ♻️ Reusable infrastructure & components
│   │   │   ├── components/
│   │   │   │   ├── data-table/             # <app-data-table> reusable component
│   │   │   │   ├── dynamic-form/           # <app-dynamic-form> reusable component
│   │   │   │   ├── confirm-dialog/         # <app-confirm-dialog> wrapper
│   │   │   │   ├── page-header/            # <app-page-header>
│   │   │   │   ├── file-upload/            # <app-file-upload> wrapper
│   │   │   │   ├── search-bar/             # <app-search-bar> debounced
│   │   │   │   ├── loading-overlay/        # <app-loading-overlay>
│   │   │   │   └── error-page/             # <app-error-page> (403, 404)
│   │   │   ├── directives/
│   │   │   │   ├── has-role.directive.ts   # Structural role directive
│   │   │   │   └── auto-focus.directive.ts # Focus management
│   │   │   ├── pipes/
│   │   │   │   ├── safe-html.pipe.ts       # DomSanitizer safe HTML (SEC-01)
│   │   │   │   └── date-format.pipe.ts     # Standard date formatting
│   │   │   └── validators/
│   │   │       └── custom-validators.ts    # Reusable form validators (SEC-04)
│   │   │
│   │   └── features/                   # 📦 Lazy-loaded feature structure
│   │       └── user-management/        # Lazy routing skeleton placeholder
│   │           └── user-management.routes.ts
│   │
│   └── assets/
│       ├── i18n/
│       │   ├── en.json
│       │   └── fr.json
│       └── images/
```

## Proposed Changes

### 1. Project Initialization & Dependencies
- Scaffold Angular 22 app with routing, SCSS, and standalone setup in `C:\Users\dell\Desktop\Legacy-to-modern\project-setup\frontend`.
- Install dependencies:
  - `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`, `@angular/platform-browser`, `@angular/animations` (`^22.2.1`)
  - `primeng` (`^22.1.2`), `@primeng/themes` (`^21.0.4`), `primeicons` (`^8.0.2`)
  - `@okta/okta-angular` (`^8.0.0`), `@okta/okta-auth-js` (`^8.0.1`)
  - `rxjs` (`^7.8.1`), `tslib` (`^2.7.0`)
- Configure strict `tsconfig.json` (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, path aliases `@core/*`, `@shared/*`, `@env/*`).

### 2. Core Security & Authentication (`src/app/core/auth`)
- **`okta-auth.config.ts`**:
  - Initializes `OktaAuth` instance with PKCE, scopes (`openid`, `profile`, `email`), redirectUri, issuer, and clientId from environment.
  - Configures secure token handling without localStorage leakage.
- **`auth.service.ts`**:
  - Standard Okta integration via `@okta/okta-angular` (`OktaAuthStateService`, `OKTA_AUTH`).
  - Signal-based state: `isAuthenticated = signal<boolean>(false)`, `currentUser = signal<User | null>(null)`.
  - Methods: `login()`, `logout()`, `getAccessToken()`, `getIdToken()`, `hasRole(role: string)`.
- **`auth.guard.ts`**:
  - Functional `canActivateFn` guard checking Okta authentication, storing requested redirect URL, redirecting unauthenticated users to Okta login.
- **`role.guard.ts`**:
  - Functional `canActivateFn` inspecting Okta token claims / user groups for required permissions.
- **`auth.interceptor.ts`**:
  - Functional `HttpInterceptorFn` attaching `Authorization: Bearer <accessToken>` only to requests matching `environment.apiBaseUrl` or configured `allowedOrigins` (SEC-13, SEC-14).

### 3. Core Interceptors & Global Messaging (`src/app/core/interceptors` & `services`)
- **`api-response.interceptor.ts`**:
  - As defined in template: intercepts API calls to `environment.apiBaseUrl`.
  - Automatically unwraps response errors (`success === false` on 200 HTTP status).
  - Triggers success toasts on mutating operations (`POST`, `PUT`, `PATCH`, `DELETE`) with message-only bodies.
  - Global error toast generation via `ApiMessageService` with status and responsecode resolution.
  - Supports `SKIP_API_MESSAGES` HttpContextToken.
- **`api-message.service.ts`**:
  - Wraps PrimeNG `MessageService` with toast de-duplication window and character capping (SEC-18).
- **`api.service.ts`**:
  - Base HTTP client for all feature services (`get`, `post`, `put`, `patch`, `delete`).
  - Automatically unwraps `ApiResponse<T>.data`.
- **`loading.interceptor.ts` & `loading.service.ts`**:
  - Tracks in-flight HTTP requests and exposes a reactive `isLoading()` Signal.
- **`csrf.interceptor.ts`**:
  - CSRF header injection for non-GET requests if session cookies are present.
- **`error-handler.service.ts`**:
  - Global Angular error boundary logging unhandled exceptions safely.

### 4. Shared Foundation (`src/app/shared/`)
- **Reusable Components**:
  - `loading-overlay`: Standalone component listening to `LoadingService`.
  - `page-header`: Standalone PrimeNG header with breadcrumbs and actions.
  - `confirm-dialog`: PrimeNG ConfirmDialog wrapper with `ConfirmationService`.
  - `data-table`: Generic PrimeNG table wrapper.
  - `dynamic-form`: Dynamic reactive form container.
  - `search-bar`: PrimeNG InputText with RxJS debounce.
  - `file-upload`: Accessible file upload with PrimeNG.
  - `error-page`: Standalone 403 / 404 error page.
- **Directives & Pipes**:
  - `has-role.directive.ts`: Controls DOM visibility based on Okta claims.
  - `safe-html.pipe.ts`: DomSanitizer-safe HTML pipe (SEC-01).
  - `date-format.pipe.ts`: DatePipe wrapper.
- **Validators**:
  - `custom-validators.ts`: Input sanitization and reactive form validation helpers (SEC-04).

### 5. Application Shell & Environments
- **`src/index.html`**:
  - Content-Security-Policy meta tag (SEC-06).
- **`src/styles.scss`**:
  - PrimeNG styling, PrimeIcons, and Aura/Lara theme presets.
- **`src/app/app.config.ts`**:
  - `provideRouter(routes, withComponentInputBinding())`
  - `provideHttpClient(withInterceptors([authInterceptor, csrfInterceptor, loadingInterceptor, apiResponseInterceptor]))`
  - `provideAnimationsAsync()`
  - `providePrimeNG({ theme: { preset: Aura } })`
  - `provideOktaAuth({ oktaAuth })`
  - `MessageService`, `ConfirmationService`, `{ provide: ErrorHandler, useClass: GlobalErrorHandlerService }`
- **`src/app/app.component.ts`**:
  - Standalone shell hosting `<p-toast />`, `<p-confirmDialog />`, `<app-loading-overlay />`, `<router-outlet />`.

## Verification Plan

### Automated Checks
1. **Compilation & Build**:
   ```cmd
   cd C:\Users\dell\Desktop\Legacy-to-modern\project-setup\frontend
   npm run build
   ```
   Must compile cleanly with zero errors in strict mode (`tsc --noEmit` and `ng build`).
2. **Lint & Security Audit**:
   - Verify `strict: true` in `tsconfig.json`.
   - Verify zero usage of `any` type across all created `.ts` files.
   - Verify absence of hardcoded secrets (SEC-02).
   - Verify CSP meta tag in `index.html` (SEC-06).
   - Verify all components use `ChangeDetectionStrategy.OnPush` and `standalone: true`.

### Manual / Structural Verification
- Verify directory structure matches `folderstructure.md` exactly.
- Confirm all files reside inside `C:\Users\dell\Desktop\Legacy-to-modern\project-setup\frontend`.
