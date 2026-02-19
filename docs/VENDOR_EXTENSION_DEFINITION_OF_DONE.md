# Vendor Extension Definition of Done

Use this checklist whenever introducing or modifying a key in
`VendorFeatures` / `ALL_EXTENSION_OPTIONS`.

## Why this exists

This checklist is the process follow-up from `VENDOR_MODULES_EXTENSIONS_AUDIT.md`
Priority 3: every extension key must ship as a complete feature, not a declaration-only
toggle.

## Required implementation checklist

An extension key is complete only when **all** items below are done:

1. **Key declaration**
   - Add the key to `VendorFeatures` in
     `vendor-panel/src/providers/vendor-type-provider/vendor-type-context.tsx`.
   - Add an `ALL_EXTENSION_OPTIONS` item with a user-facing label and description.

2. **Default mappings by vendor type**
   - Add explicit defaults in `getFeaturesByType(...)` for every `VendorType`
     (`producer`, `garden`, `kitchen`, `maker`, `restaurant`, `mutual_aid`, `default`).
   - Add the key to `buildFeaturesFromExtensions(...)` so persisted extension arrays
     can be converted back into `VendorFeatures` safely.

3. **Runtime behavior**
   - Wire the key into a real UX surface in one or both of:
     - `vendor-panel/src/hooks/navigation/use-vendor-navigation.tsx`
     - `vendor-panel/src/routes/dashboard/config/dashboard-config.ts`
   - Confirm behavior is visible to users (route/CTA/onboarding/nav), not a dead toggle.

4. **Settings wiring**
   - Confirm the key appears in `vendor-panel/src/routes/settings/extensions/extensions.tsx`.
   - Confirm save/reset behavior continues to persist `enabled_extensions` correctly.

5. **Tests / assertions**
   - Add or update tests for enabled **and** disabled states of runtime behavior.
   - Prefer updating these suites first:
     - `vendor-panel/src/hooks/navigation/use-vendor-navigation.spec.ts`
     - `vendor-panel/src/routes/dashboard/config/dashboard-config.spec.ts`
   - Run completeness and test checks before opening PR.

## Validation commands

```bash
pnpm check:vendor-completeness
pnpm --dir vendor-panel test -- --runInBand
```

If a command cannot run in your environment, include the reason in your PR.
