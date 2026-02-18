# Vendor Extension Definition of Done

Use this checklist whenever introducing a new key in `VendorFeatures` / `ALL_EXTENSION_OPTIONS`.

## Required implementation checklist

A new extension key is complete only when all items below are done:

1. **Key declaration**
   - Add the key to `VendorFeatures`.
   - Add a corresponding option entry in `ALL_EXTENSION_OPTIONS` with user-facing label and description.

2. **Default mappings by vendor type**
   - Set explicit defaults in every `vendorTypeConfigs` feature map.
   - Ensure `DEFAULT_FEATURES` includes a default value for the key.

3. **Runtime behavior**
   - Wire the key into navigation and/or dashboard flow behavior.
   - Verify the feature gate is functional, not a dead toggle.

4. **Settings wiring**
   - Confirm the key appears in extension settings and can be toggled.
   - Ensure persisted extension arrays map correctly back to `VendorFeatures`.

5. **Tests / assertions**
   - Add or update tests covering enabled and disabled states for runtime behavior.
   - Run `pnpm check:vendor-completeness` to confirm guard coverage.

## Validation commands

```bash
pnpm check:vendor-completeness
pnpm --filter vendor-panel test -- --runInBand
```

If a command cannot run in your environment, include the reason in your PR.
