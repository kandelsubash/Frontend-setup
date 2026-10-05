# Skill: Angular Code Generation

## Purpose
Provides reusable code generation patterns, templates, Angular CLI commands,
coding standards, and API handling rules for generating secure Angular 18+
components, services, and configuration.

This is the **single source of truth** for all coding standards. Do NOT
duplicate these rules in other files.

## When to Use
- **Project Scaffolder Agent** (Phase 2)
- **Reusability Architect Agent** (Phase 2)
- **Component Generator Agent** (Phase 3)
- **Service Generator Agent** (Phase 3)
- **Integration Agent** (Phase 4)

## Templates Directory
See `skills/angular_codegen/templates/` for concrete code templates:
- `auth_interceptor.ts.md` — HTTP-only cookie auth (SEC-07, SEC-13, SEC-14)
- `api_response_interceptor.ts.md` — Standardized `{ data, success, message }` unwrapping
- `okta_auth_config.ts.md` — Okta PKCE + HTTP-only cookie flow
- `api_service.ts.md` — Base ApiService with `withCredentials: true`
- `csrf_interceptor.ts.md` — CSRF double-submit cookie pattern (SEC-03)

---

## Component Template (Standalone, Signals-based, OnPush)

```typescript
import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
// Shared components
import { AppDataTableComponent } from '@shared/components/data-table/data-table.component';
import { AppPageHeaderComponent } from '@shared/components/page-header/page-header.component';
// Services
import { <Entity>Service } from '../services/<entity>.service';
import { <Entity> } from '../models/<entity>.model';

@Component({
  selector: 'app-<name>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    AppDataTableComponent,
    AppPageHeaderComponent,
  ],
  templateUrl: './<name>.component.html',
  styleUrl: './<name>.component.scss',
})
export class <Name>Component implements OnInit {
  private readonly <entity>Service = inject(<Entity>Service);

  // Use Signals for local state
  items = signal<<Entity>[]>([]);
  loading = signal<boolean>(false);
  selectedItem = signal<<Entity> | null>(null);

  ngOnInit(): void {
    this.load();
  }

  /** Loads all items from the API. */
  load(): void {
    this.loading.set(true);
    this.<entity>Service.getAll().subscribe({
      next: (data) => this.items.set(data),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
```

## Service Template

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { <Entity> } from '../models/<entity>.model';

@Injectable({ providedIn: 'root' })
export class <Entity>Service {
  private readonly api = inject(ApiService);
  private readonly endpoint = '<entity-plural>';

  /** Retrieves all entities. */
  getAll(): Observable<<Entity>[]> {
    return this.api.get<<Entity>[]>(this.endpoint);
  }

  /** Retrieves a single entity by ID. */
  getById(id: number): Observable<<Entity>> {
    return this.api.get<<Entity>>(`${this.endpoint}/${id}`);
  }

  /** Creates a new entity. */
  create(entity: <Entity>): Observable<<Entity>> {
    return this.api.post<<Entity>>(this.endpoint, entity);
  }

  /** Updates an existing entity. */
  update(id: number, entity: <Entity>): Observable<<Entity>> {
    return this.api.put<<Entity>>(`${this.endpoint}/${id}`, entity);
  }

  /** Deletes an entity by ID. */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

Note: No `map(this.mapResponse)` is needed because `ApiService` already unwraps the
standardized `ApiResponse<T>` envelope (see `api_service.ts.md` template).

## Angular CLI Commands Reference

```bash
# New standalone component
ng generate component features/<module>/components/<name> --standalone --change-detection OnPush --skip-tests=false

# New service
ng generate service features/<module>/services/<entity> --skip-tests=false

# New model interface
ng generate interface features/<module>/models/<entity>

# New route guard
ng generate guard core/auth/<name> --implements CanActivate

# New interceptor
ng generate interceptor core/interceptors/<name>
```

---

## Coding Standards (Mandatory — Non-Negotiable)

### Component Rules
1. `standalone: true` on ALL components — no NgModules
2. `changeDetection: ChangeDetectionStrategy.OnPush` on ALL components
3. `inject()` function for DI — NOT constructor injection
4. Signals (`signal<T>()`, `computed()`) for all local reactive state
5. `@if` / `@for` control flow — NOT `*ngIf` / `*ngFor`
6. All `@for` loops MUST use `track` (e.g., `@for (item of items(); track item.id)`)
7. No `any` types anywhere — use `unknown` when uncertain
8. Every public method must have a JSDoc comment
9. Component files: `.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
10. Barrel files (`index.ts`) in each feature folder

### Service Rules
1. `@Injectable({ providedIn: 'root' })` for app-wide services
2. All methods that call APIs return `Observable<T>` (not `Promise`)
3. Inject `ApiService` (not `HttpClient` directly) — ensures `withCredentials: true`
4. Error handling delegated to `error.interceptor.ts` (not in services)
5. Module-specific errors: `.pipe(catchError(...))` with specific logic only
6. All API URLs via `environment.apiBaseUrl` — never hardcoded (SEC-02)
7. All injected services are `private readonly`

### Security Rules (Enforced During Generation)
- No `[innerHTML]` bindings (SEC-01)
- No hardcoded secrets/URLs (SEC-02)
- No `eval()`, `new Function()`, `setTimeout(string)` (SEC-05)
- No `localStorage` or `sessionStorage` for tokens (SEC-07, SEC-13)
- No `bypassSecurityTrust*` without documented approval (SEC-11)
- All form controls must have validators (SEC-04)
- `withCredentials: true` on all API calls (SEC-14)

### API Response Handling
All backend APIs return: `{ data: T, timestamp: string, responsecode: string, message: string, success: boolean }`
- `ApiService` unwraps `.data` automatically
- `apiResponseInterceptor` handles success/error messages globally
- Components receive clean typed data — no envelope handling needed

### Naming Conventions
| Item | Convention | Example |
|------|-----------|--------|
| Component class | PascalCase + Component | `UserListComponent` |
| Component selector | kebab-case | `app-user-list` |
| Service class | PascalCase + Service | `UserService` |
| Model interface | PascalCase | `User` |
| DTO interface | PascalCase + Response | `UserResponse` |
| Signal | camelCase | `items`, `loading` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |

### File Organization
```
src/app/
├── core/
│   ├── auth/          # okta-auth.config, auth.service, auth.guard, role.guard
│   ├── interceptors/  # auth, csrf, error, loading, api-response interceptors
│   ├── services/      # api.service, notification.service
│   └── models/        # api-response.model, user.model
├── shared/
│   └── components/    # Reusable shared components
├── features/
│   └── <module>/
│       ├── components/
│       ├── services/
│       ├── models/
│       ├── <module>.routes.ts
│       └── index.ts
└── app.config.ts      # Providers, interceptors, routing
```
