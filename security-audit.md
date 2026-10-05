## Rule Definitions

### SEC-01: No XSS Vectors (CWE-79)
**Check:** Scan for `[innerHTML]` binding in HTML templates.
**Auto-fix:** Replace with safe pipe: `{{ value | safeHtml }}` using `DomSanitizer`.

### SEC-02: No Hardcoded Secrets (CWE-798)
**Check:** Regex in `.ts` and environment files:
```
/(apiKey|password|secret|token|clientId|clientSecret|issuer)\s*[:=]\s*['"][^'"]{8,}/i
```
**Auto-fix:** Not auto-fixable — move to `environment.ts` placeholders injected via CI/CD.

### SEC-03: CSRF Protection (CWE-352)
**Check:** Verify `CsrfInterceptor` is registered in `app.config.ts`.
**Auto-fix:** Add interceptor to `withInterceptors([])`.

### SEC-04: Input Validation (CWE-20)
**Check:** All `FormControl` instances have at least one `Validator`.
**Auto-fix:** Add `Validators.required` as minimum.

### SEC-05: No Dynamic Code Execution (CWE-95)
**Check:** Grep for `eval(`, `new Function(`, `setTimeout(string`.
**Auto-fix:** Not auto-fixable.

### SEC-06: Content Security Policy (CWE-693)
**Check:** Verify `index.html` has strict `Content-Security-Policy` meta tag.
**Auto-fix:** Insert default strict CSP meta tag.

### SEC-07: HTTP-Only Cookie Token Storage (CWE-922)
**Check:** Auth tokens MUST be stored as HTTP-only, Secure, SameSite=Strict cookies set by the backend. Grep for any `localStorage` or `sessionStorage` usage with auth-related keys. Verify Okta callback proxies through backend to set HTTP-only cookie.
**Auto-fix:** Not auto-fixable — requires backend auth proxy architecture.

### SEC-08: Secure Cookies (CWE-614)
**Check:** All cookies must have HttpOnly, Secure, SameSite=Strict. No `document.cookie` assignments.
**Auto-fix:** Not auto-fixable — backend responsibility.

### SEC-09: No Wildcard CORS (CWE-942)
**Check:** Grep for `Access-Control-Allow-Origin: *` in proxy configs.
**Auto-fix:** Replace `*` with explicit origin.

### SEC-10: Clean Dependencies (CWE-937)
**Check:** `npm audit --audit-level=high --json`.
**Auto-fix:** `npm audit fix`; flag unresolvable.

### SEC-11: No Unsafe Bypasses (CWE-116)
**Check:** Grep for `bypassSecurityTrust*` usage.
**Auto-fix:** Not auto-fixable — requires human approval.

### SEC-12: Strict TypeScript
**Check:** `tsc --noEmit` with `strict: true`. Zero `any` types.
**Auto-fix:** Not auto-fixable for type errors.

### SEC-13: No Client-Side Token Storage (CWE-922)
**Check:** Grep for `sessionStorage.setItem`, `sessionStorage.getItem`, `localStorage.setItem`, `localStorage.getItem` combined with keywords: token, auth, access, refresh, jwt, bearer, session, credential. Also check `window.sessionStorage` and `window.localStorage`.
**Auto-fix:** Not auto-fixable — remove all client-side token storage.

### SEC-14: Credentials on Every Request (CWE-319)
**Check:** Verify `auth.interceptor.ts` sets `withCredentials: true` on every outgoing request. Grep `HttpClient` calls missing `withCredentials: true`.
**Auto-fix:** Add `withCredentials: true` in auth interceptor request clone.

---

## Audit Script Workflow
```
1. Run ESLint: ng lint --format json → parse findings
2. Run TypeScript: tsc --noEmit → parse errors
3. Run npm audit: npm audit --audit-level=high --json → parse advisories
4. Run custom regex scans for SEC-02, SEC-05, SEC-07, SEC-09, SEC-11, SEC-13
5. Verify structural checks for SEC-03, SEC-04, SEC-06, SEC-14
6. Aggregate into SecurityReport.json
7. Apply auto-fixes where possible
8. Re-run affected checks after fixes
9. Return final SecurityReport.json
```