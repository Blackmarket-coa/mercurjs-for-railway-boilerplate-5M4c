# QA Work Tracker

_Last updated: 2026-02-13 (format and status alignment)_
_Source: `QA_AUDIT_REPORT.md`_

## Goal

Track QA remediation items needed to move this repository from
**NOT RELEASE-READY** to release-ready.

## Overall status

- Current release status: **NOT RELEASE-READY**.
- Blocking focus:
  - admin lint baseline,
  - vendor typecheck,
  - backend test depth,
  - CI guardrails for translation schema drift.

## Priority tracker

- **P0 · Admin panel**
  - Task: Reduce lint failures to zero, or adopt an approved staged baseline.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ⬜ Not started.
  - Notes: Audit reported 5,526 errors and 58 warnings.

- **P0 · Vendor panel**
  - Task: Fix TypeScript build/typecheck failures.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ⬜ Not started.
  - Notes: Includes module resolution, extension key, and mismatch errors.

- **P0 · i18n contracts**
  - Task: Resolve admin/vendor translation schema drift and keep tests green.
  - Owner: Codex.
  - Target date: 2026-02-13.
  - Status: ✅ Completed.
  - Notes: Translation schemas now match `en.json` in both apps.

- **P1 · Backend quality**
  - Task: Add real unit tests for critical modules, including auth,
    financial flows, and workflow edges.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ⬜ Not started.

- **P1 · Tooling consistency**
  - Task: Consolidate package manager and lockfile strategy across the repo.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ⬜ Not started.
  - Notes: Removes workspace ambiguity warnings and lockfile fragmentation.

- **P1 · Security CI**
  - Task: Add deterministic security audit in CI with persisted artifacts.
  - Owner: Unassigned.
  - Target date: TBD.
  - Status: ⬜ Not started.

## Exit criteria tracker

- Admin panel gate: `lint` and `test` both green.
  - Status: 🔄 In progress (`test` ✅, `lint` pending).
- Vendor panel gate: `lint`, `typecheck`, and `test` all green.
  - Status: 🔄 In progress (`lint` + `test` ✅, `typecheck` pending).
- Backend gate: `typecheck` green and minimum unit/integration coverage
  threshold enforced.
  - Status: ⬜ Not started.
- Storefront gate: lint warnings triaged (fixed or intentionally waived).
  - Status: ⬜ Not started.
- Security gate: security audit report artifact available in CI for each PR.
  - Status: ⬜ Not started.

## Execution checklist

### Phase 1 — Unblock CI health

- [ ] Triage top admin lint categories and decide fix-all vs staged baseline.
- [ ] Fix vendor typecheck errors until `npm run typecheck` is green.
- [x] Reconcile translation schema vs locale files in admin and vendor apps.
- [ ] Add or adjust PR CI checks to fail on translation contract drift.

### Phase 2 — Raise confidence and consistency

- [ ] Add backend unit tests for critical behavior paths.
- [ ] Define and enforce coverage threshold in CI.
- [ ] Decide a single package manager and lockfile model, then migrate apps.
- [ ] Add deterministic `npm audit` (or equivalent) CI step with retained
  report artifacts.

### Phase 3 — Release readiness verification

- [ ] Run full quality gate suite and confirm all exit criteria are met.
- [ ] Record evidence links (job URLs and artifacts) in this tracker.
- [ ] Mark release readiness as complete.

## Evidence log

- 2026-02-13
  - Change: Initial tracker created from QA audit recommendations.
  - Evidence: `QA_AUDIT_REPORT.md`.
  - Result: ✅.

- 2026-02-13
  - Change: Admin/vendor translation schema parity fixes landed and verified.
  - Evidence:
    - `npm run test --prefix admin-panel`
    - `npm run test --prefix vendor-panel`
  - Result: ✅.
