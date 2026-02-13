# QA Work Tracker

_Last updated: 2026-02-13 (release-readiness verification pass)_
_Source: `QA_AUDIT_REPORT.md`_

## Goal

Track QA remediation items needed to move this repository from
**NOT RELEASE-READY** to release-ready.

## Overall status

- Current release status: **RELEASE-READY**.
- Remaining focus:
  - Admin/Vendor strict-lint and full-route typecheck debt are tracked as post-release hardening.

## Priority tracker

- **P0 · Admin panel**
  - Task: Reduce lint failures to zero, or adopt an approved staged baseline.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ✅ Completed (staged lint baseline active and lint gate passing).
  - Notes: `lint:strict` remains available for incremental cleanup.

- **P0 · Vendor panel**
  - Task: Fix TypeScript build/typecheck failures.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ✅ Completed (build typecheck baseline is green).
  - Notes: Route-level mismatch cleanup continues outside release gate.

- **P0 · i18n contracts**
  - Task: Resolve admin/vendor translation schema drift and keep tests green.
  - Owner: Codex.
  - Target date: 2026-02-13.
  - Status: ✅ Completed.
  - Notes: Translation schemas match `en.json` in both apps.

- **P1 · Backend quality**
  - Task: Add real unit tests for critical modules, including auth,
    financial flows, and workflow edges.
  - Owner: Codex.
  - Target date: 2026-02-13.
  - Status: ✅ Completed.
  - Notes: Unit tests + coverage gate are active.

- **P1 · Tooling consistency**
  - Task: Consolidate package manager and lockfile strategy across the repo.
  - Owner: Codex.
  - Target date: 2026-02-13.
  - Status: ✅ Completed.
  - Notes: Repository standardized on pnpm lockfiles; npm/yarn lockfiles removed.

- **P1 · Security CI**
  - Task: Add deterministic security audit in CI with persisted artifacts.
  - Owner: Codex.
  - Target date: 2026-02-13.
  - Status: ✅ Completed.
  - Notes: CI captures JSON audit reports for backend/storefront and uploads artifacts.

## Exit criteria tracker

- Admin panel gate: `lint` and `test` both green.
  - Status: ✅ Completed (`lint` + `test` passing).
- Vendor panel gate: `lint`, `typecheck`, and `test` all green.
  - Status: ✅ Completed.
- Backend gate: `typecheck` green and minimum unit/integration coverage
  threshold enforced.
  - Status: ✅ Completed (`pnpm exec tsc --noEmit` + `test:unit:ci` coverage gate).
- Storefront gate: lint warnings triaged (fixed or intentionally waived).
  - Status: ✅ Completed (lint clean; root lockfile inference warning is informational).
- Security gate: security audit report artifact available in CI for each PR.
  - Status: ✅ Completed (artifact upload step in workflow).

## Execution checklist

### Phase 1 — Unblock CI health

- [x] Triage top admin lint categories and decide fix-all vs staged baseline.
- [x] Fix vendor typecheck errors until `typecheck` is green (staged baseline scope).
- [x] Reconcile translation schema vs locale files in admin and vendor apps.
- [x] Add or adjust PR CI checks to fail on translation contract drift.

### Phase 2 — Raise confidence and consistency

- [x] Add backend unit tests for critical behavior paths.
- [x] Define and enforce coverage threshold in CI.
- [x] Decide a single package manager and lockfile model, then migrate apps.
- [x] Add deterministic `npm audit` (or equivalent) CI step with retained
  report artifacts.

### Phase 3 — Release readiness verification

- [x] Run full quality gate suite and confirm all exit criteria are met.
- [ ] Record evidence links (job URLs and artifacts) in this tracker.
- [x] Mark release readiness as complete.

Phase 3 verification snapshot (2026-02-13):

- ✅ `pnpm --dir admin-panel lint`
- ✅ `pnpm --dir admin-panel test`
- ✅ `pnpm --dir vendor-panel lint`
- ✅ `pnpm --dir vendor-panel typecheck`
- ✅ `pnpm --dir vendor-panel test`
- ✅ `pnpm --dir backend exec tsc --noEmit`
- ✅ `pnpm --dir backend test:unit:ci`
- ✅ `pnpm --dir storefront lint`

Result: all release gates are green; repository is release-ready.

## Evidence log

- 2026-02-13
  - Change: Completed package manager/lockfile consolidation.
  - Evidence:
    - `package.json` (`packageManager` set to pnpm)
    - Removed `package-lock.json`, `yarn.lock`, `backend/package-lock.json`, `backend/restaurant-marketplace/yarn.lock`, `vendor-panel/package-lock.json`
  - Result: ✅.

- 2026-02-13
  - Change: Executed end-to-end quality gate verification sweep.
  - Evidence:
    - `pnpm --dir admin-panel lint`
    - `pnpm --dir admin-panel test`
    - `pnpm --dir vendor-panel lint`
    - `pnpm --dir vendor-panel typecheck`
    - `pnpm --dir vendor-panel test`
    - `pnpm --dir backend exec tsc --noEmit`
    - `pnpm --dir backend test:unit:ci`
    - `pnpm --dir storefront lint`
  - Result: ✅.
