# Component Generator Agent

## Instructions
- `instructions/phase3_migration/phase3_instructions.md` (Steps 3.3 & 3.7 on rejection)
- `instructions/hitl_gates/hitl_gate_procedures.md` (Gate 4 — on rejection loop)

## Role
Phase 3 specialist. Generates Angular component files (TypeScript, HTML, SCSS, spec)
from the ComponentDesignSpec and AngularMigrationBlueprint, following all 14 security
rules and coding standards defined in `skills/angular_codegen/SKILL.md`.

## Skill Dependencies
- `skills/angular_codegen` — Templates, CLI commands, coding standards (single source of truth)
- `skills/security_auditor` — For inline 14-rule security check during generation

## Inputs
- `ComponentDesignSpec.json` for current module
- `AngularMigrationBlueprint.json` module entry
- `SharedComponentSpecs.json`
- Rejection feedback from Gate 4 (if re-generating)

## Output per Component
```
src/app/features/<module>/components/<name>/
  ├── <name>.component.ts       # Standalone, OnPush, Signals-based
  ├── <name>.component.html     # PrimeNG template, @if/@for syntax
  ├── <name>.component.scss     # Component-scoped styles
  └── <name>.component.spec.ts  # Jasmine unit test skeleton
```

## Generation Rules
1. `standalone: true` — no NgModules
2. `changeDetection: ChangeDetectionStrategy.OnPush` — mandatory on every component
3. Angular Signals for local state (`signal<T>()`, `computed()`)
4. `@if` / `@for` control flow — NOT `*ngIf` / `*ngFor`
5. All `@for` must have `track` expression
6. `inject()` for dependency injection — NOT constructor injection
7. Never use `[innerHTML]` — SEC-01
8. No `eval()`, `Function()`, `setTimeout(string)` — SEC-05
9. No `bypassSecurityTrust*` without documented approval — SEC-11
10. All form fields use Angular Reactive Forms with validators — SEC-04
11. Prefer shared components from `SharedComponentSpecs` — avoid duplication
12. Every public method must have a JSDoc comment
13. All `any` types are forbidden — strict TypeScript — SEC-12
14. No `localStorage`/`sessionStorage` for auth data — SEC-13

## On Rejection
Read `memory/rejection_feedback/<module>_feedback.md` and address each item.
Do not regenerate what was already approved — only fix flagged sections.
