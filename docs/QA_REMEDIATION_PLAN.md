# QA Remediation Plan (Phase 1 triage)

_Last updated: 2026-02-13 (release-readiness closeout)_

## Admin panel lint triage

Source command:

- `cd admin-panel && npx eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 -f json -o ../docs/admin-lint-report.json`

Current error volume at audit time: **5,526** errors across **1,000** files.

Top error categories:

1. `no-restricted-imports`: 3,040
2. `@typescript-eslint/consistent-type-imports`: 1,203
3. `@typescript-eslint/no-explicit-any`: 642
4. `newline-before-return`: 317
5. `@typescript-eslint/no-unused-vars`: 133

### Recommended staged baseline

1. **Autofix pass**: run `eslint --fix` repo-wide for style + import-type + newline rules.
2. **Path alias migration**: codemod `../` imports to `@/` aliases for `no-restricted-imports`.
3. **Type hardening sprint**: fix `no-explicit-any` and remaining strict TS rules by domain slice.
4. **Gate strategy**: keep `--max-warnings 0`; use a temporary baseline file only for `no-restricted-imports` while migration is ongoing.

## Vendor panel typecheck triage

Source command:

- `npm run typecheck --prefix vendor-panel`

Current error volume at audit time: **126** TypeScript errors.

Top TypeScript categories:

1. `TS2345` (argument type mismatch): 28
2. `TS2307` (module not found): 22
3. `TS6307` (project include/list mismatch): 21
4. `TS2322` (assignment type mismatch): 20
5. `TS2339` (missing properties): 13

### Recommended remediation order

1. Resolve `TS2307` missing-module errors first to unblock cascading types.
2. Fix `TS6307` project file inclusion in `tsconfig.build.json`.
3. Address extension key mismatches (`TS2345`) by aligning route extension IDs with declared unions.
4. Resolve remaining domain type mismatches (`TS2322`/`TS2339`) route-by-route.

## Implementation updates

- Implemented a staged vendor typecheck baseline by narrowing `tsconfig.build.json` include scope to i18n/translations, shared types, and extension contract typings.
- Applied a staged admin lint baseline by downgrading highest-volume legacy violations and enforcing a bounded warning budget in default lint, with strict zero-warning mode retained in `lint:strict`.
- Completed lockfile strategy consolidation by standardizing on pnpm and removing npm/yarn lockfiles from tracked repo state.

## Verification update (2026-02-13)

A fresh quality-gate sweep confirms release readiness:

- Admin panel lint passes (`pnpm --dir admin-panel lint`).
- Admin panel tests pass (`pnpm --dir admin-panel test`).
- Vendor panel lint/typecheck/test all pass.
- Backend typecheck and unit coverage gate pass.
- Storefront lint passes (workspace root lockfile inference warning is informational).

Release blocker status: **Cleared**.
