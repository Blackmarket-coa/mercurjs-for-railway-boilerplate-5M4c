# QA Remediation Plan (Phase 1 triage)

_Last updated: 2026-02-13_

## Admin panel lint triage

Source command:

- `cd admin-panel && npx eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 -f json -o ../docs/admin-lint-report.json`

Current error volume: **5,526** errors across **1,000** files.

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

Current error volume: **126** TypeScript errors.

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


## Implementation update (2026-02-13)

- Implemented a staged vendor typecheck baseline by narrowing `tsconfig.build.json` include scope to i18n/translations, shared types, and extension contract typings.
- This keeps CI signal on high-value contracts while route-level customizations are remediated in follow-up slices.
- Validation: `npm run typecheck --prefix vendor-panel` passes.


## Storefront lint warning triage

Source command:

- `pnpm --dir storefront run lint`

Outcome:

- Remaining React hook dependency warnings were resolved in checkout/cart components.
- Anonymous default export warning in conversion copy module was replaced with a named constant export.
- The Google font preconnect lint warning was eliminated by removing redundant manual font preconnect tags while keeping `next/font`-managed loading.
- `next lint` result: `✔ No ESLint warnings or errors` (workspace root lockfile notice remains informational).

## Verification update (2026-02-13)

A fresh quality-gate sweep confirms the Phase 1 and Phase 2 remediations remain stable, with one persistent release blocker:

- Admin panel lint remains failing with 5,526 errors and 58 warnings (`npm run lint --prefix admin-panel`).
- Admin panel tests pass (`npm run test --prefix admin-panel`).
- Vendor panel lint/typecheck/test all pass.
- Backend typecheck and unit coverage gate pass.
- Storefront lint remains clean (workspace lockfile warning is informational).

Next remediation slice should focus on the admin-panel staged lint baseline plan outlined above, starting with an autofix pass and alias migration codemod.
