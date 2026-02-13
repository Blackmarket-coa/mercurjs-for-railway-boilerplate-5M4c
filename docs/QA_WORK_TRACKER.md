# QA Work Tracker

_Last updated: 2026-02-13 (i18n tracker refreshed)_
_Source: `QA_AUDIT_REPORT.md`_

## Goal

Track execution of the QA remediation items required to move the repository from **NOT RELEASE-READY** to release-ready.

## Overall Status

- Current release status: **NOT RELEASE-READY**
- Blocking focus: admin lint, vendor typecheck, translation schema drift, backend test depth.

## Priority Tracker

| Priority | Workstream | Task | Owner | Target Date | Status | Notes |
|---|---|---|---|---|---|---|
| P0 | Admin panel | Reduce lint failures to zero or adopt approved phased baseline policy | Unassigned | TBD | ⬜ Not started | Audit reported 5,526 errors + 58 warnings. |
| P0 | Vendor panel | Fix TypeScript build/typecheck failures | Unassigned | TBD | ⬜ Not started | Includes module resolution, extension key, and mismatch errors. |
| P0 | i18n contracts | Resolve admin/vendor translation schema drift and keep tests green | Codex | 2026-02-13 | ✅ Completed | Updated admin/vendor translation schemas to match `en.json`; tests now pass in both apps. |
| P1 | Backend quality | Add real unit tests for critical modules (auth, financial flows, workflow edges) | Unassigned | TBD | ⬜ Not started | Existing unit test signal is weak due to no discovered tests. |
| P1 | Tooling consistency | Consolidate package manager/lockfile strategy across repo | Unassigned | TBD | ⬜ Not started | Remove workspace ambiguity warnings and lockfile fragmentation. |
| P1 | Security CI | Add deterministic security audit in CI with persisted artifact report | Unassigned | TBD | ⬜ Not started | Ensure each PR has an audit report artifact. |

## Exit Criteria Tracker

| Criteria | Requirement | Status |
|---|---|---|
| Admin panel gate | `lint` and `test` both green | 🔄 In progress (`test` ✅, `lint` pending) |
| Vendor panel gate | `lint`, `typecheck`, and `test` all green | 🔄 In progress (`lint` + `test` ✅, `typecheck` pending) |
| Backend gate | `typecheck` green + minimum unit/integration coverage threshold enforced | ⬜ |
| Storefront gate | Lint warnings triaged (fixed or intentionally waived) | ⬜ |
| Security gate | Security audit report artifact available in CI for each PR | ⬜ |

## Execution Checklist

### Phase 1 — Unblock CI health

- [ ] Triage top admin lint categories and decide: fix-all vs staged baseline policy.
- [ ] Fix vendor typecheck errors until `npm run typecheck` is green.
- [x] Reconcile translation schema vs locale files in admin and vendor apps.
- [ ] Add/adjust PR CI checks to fail on translation contract drift.

### Phase 2 — Raise confidence and consistency

- [ ] Add backend unit tests for critical behavior paths.
- [ ] Define/enforce coverage threshold in CI (unit + selected integration).
- [ ] Decide single package manager + lockfile model and migrate all apps.
- [ ] Add deterministic `npm audit` (or equivalent) CI step with report artifact retention.

### Phase 3 — Release readiness verification

- [ ] Run full quality gate suite and confirm all exit criteria are met.
- [ ] Record evidence links (job URLs / artifacts) in this tracker.
- [ ] Mark release readiness as complete.

## Evidence Log

| Date | Change | Evidence | Result |
|---|---|---|---|
| 2026-02-13 | Initial tracker created from QA audit recommendations | `QA_AUDIT_REPORT.md` | ✅ |
| 2026-02-13 | Admin/vendor translation schema parity fixes landed and verified with test runs | `npm run test --prefix admin-panel`; `npm run test --prefix vendor-panel` | ✅ |
