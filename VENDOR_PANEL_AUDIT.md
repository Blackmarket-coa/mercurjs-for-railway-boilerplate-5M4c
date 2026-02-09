# Vendor Panel UI Audit Report

**Date:** 2026-02-09  
**Scope:** `vendor-panel/src` (UI-focused static/code quality audit)  
**Method:** Scripted repository checks (`rg`, `npm run lint`, `npm run typecheck`) plus focused file review.

---

## Executive Summary

The vendor panel UI architecture is broad and feature-rich, but the current branch is not in a releasable quality state due to baseline TypeScript and lint/tooling failures. The previous report is now stale (for example, TODO/FIXME counts and console usage changed significantly).

| Category | Status | Notes |
|---|---|---|
| UI structure/routing | Good | Mature route and component structure remains in place |
| Lint baseline | Blocked | ESLint v9 cannot run with `.eslintrc`-style config |
| Type safety baseline | Failing | `npm run typecheck` returns many compile errors |
| Code hygiene | Mixed | Debug `console.*` usage still present |
| Legacy audit freshness | Outdated | Prior metrics no longer match current codebase |

---

## Key Findings

### 1) Lint workflow is currently broken (High)

`npm run lint` fails before linting files because ESLint v9 expects `eslint.config.*`, while this project is configured via `.eslintrc.json`.

**Impact:** CI/local lint cannot enforce UI quality standards until config is migrated or ESLint is pinned.

---

### 2) TypeScript baseline is failing across many UI areas (High)

`npm run typecheck` fails with a broad set of errors, including:
- `ImportMetaEnv` type gaps (`import.meta.env.DEV` typing)
- unused imports and declarations in layout/routes
- API hook typing incompatibilities
- missing module/type references in `shows/*`, `utils/*`, and related areas

**Impact:** No reliable type-safety safety net for UI changes; regressions are harder to catch.

---

### 3) Prior report metrics are stale and should not be used for planning (Medium)

Fresh quick metrics from `vendor-panel/src`:
- `TODO|FIXME`: **0**
- token-level `any` matches: **414**
- `console.log|warn|error`: **7**

This differs materially from the previous report (e.g., “28 TODO/FIXME”, “73 any”, “27 console statements”), indicating the audit document needed refresh.

---

## UI Quality Observations

### Strengths
- Existing UI is organized by domain routes/components, making targeted refactors feasible.
- Vendor panel continues to separate hooks, routes, and reusable UI building blocks in a scalable way.

### Risks
- Broken lint/typecheck tooling masks UI quality issues.
- Large `any` footprint increases risk of runtime UI/API shape mismatches.
- Remaining debug console statements can leak noise into production logs.

---

## Recommended Remediation Plan

### Immediate (P0)
1. Restore lint operability:
   - either migrate to flat config (`eslint.config.js`) or pin ESLint to v8-compatible setup.
2. Establish a passing TypeScript baseline:
   - start with module resolution/type declaration errors, then tackle API generic mismatches.

### Near-term (P1)
1. Reduce `any` usage in high-churn UI hooks/components.
2. Remove or gate remaining `console.*` statements behind dev-only logging utilities.

### Ongoing (P2)
1. Add audit freshness checks (small script in CI) to prevent stale metrics in audit docs.
2. Track UI quality KPIs (type errors, lint warnings, accessibility checks) per release.

---

## Commands Executed

From `vendor-panel/`:
- `rg "TODO|FIXME" src | wc -l` → `0`
- `rg "\\bany\\b" src | wc -l` → `414`
- `rg "console\\.(log|warn|error)" src | wc -l` → `7`
- `npm run lint` → fails (ESLint config format mismatch)
- `npm run typecheck` → fails (multiple TS errors)

---

*Audit updated on 2026-02-09 to reflect current repository state.*
