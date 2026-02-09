# Vendor panel workflow audit

## Scope checked
- GitHub Actions workflow: `.github/workflows/ci.yml`
- Vendor panel scripts from `vendor-panel/package.json`

## Potential issues found

1. **No vendor-panel job currently runs in CI**
   - The workflow only installs, type-checks, tests, and builds the backend.
   - `vendor-panel` appears only in `cache-dependency-path`, not as a validated project target.
   - Risk: vendor panel regressions can merge without any CI signal.

2. **The `lint` job does not run any lint command**
   - The job is named `Lint & Type Check` but only runs backend TypeScript (`tsc --noEmit`).
   - Risk: lint errors in all apps (including vendor panel) are not checked.

3. **Critical checks are configured with `continue-on-error: true`**
   - Backend typecheck, unit tests, security audits, and integration tests are currently allowed to fail.
   - Risk: pipeline can look green while checks fail.

4. **Vendor panel has failing quality gates today when run locally**
   - `pnpm -C vendor-panel typecheck` currently fails with multiple TypeScript errors.
   - `pnpm -C vendor-panel build:preview` currently fails due an icon import mismatch (`Package` not exported by `@medusajs/icons`).
   - Risk: adding strict vendor-panel CI checks immediately would fail until existing issues are fixed.

## Suggested rollout

1. Add a `vendor-panel` CI job that installs dependencies and runs:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build:preview`
2. Initially mark `typecheck` and `build` as non-blocking for 1-2 sprints while backlog is cleaned up.
3. Remove `continue-on-error` from core checks once current failures are resolved.
4. Keep deploy-notification job dependent on all required quality jobs.
