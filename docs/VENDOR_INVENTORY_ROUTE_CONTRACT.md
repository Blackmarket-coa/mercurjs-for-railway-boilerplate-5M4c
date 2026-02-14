# Vendor Inventory Route Contract Map

This document defines the required route contract for vendor inventory features used by the vendor panel.

## Critical endpoints

| Endpoint                  | Purpose                                                   | Frontend usage                                   | Provider expectation                                                                             |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `/vendor/inventory-items` | List/create inventory items and batch level updates       | `vendor-panel/src/hooks/api/inventory.tsx`       | Local `src/api/vendor/inventory-items/*` route set **or** plugin provider (`@mercurjs/b2c-core`) |
| `/vendor/reservations`    | Reservation list/detail/mutation for inventory visibility | `vendor-panel/src/hooks/api/reservations.tsx`    | Local `src/api/vendor/reservations/*` route set **or** plugin provider (`@mercurjs/b2c-core`)    |
| `/vendor/stock-locations` | Seller stock location list/detail/mutations               | `vendor-panel/src/hooks/api/stock-locations.tsx` | Local `src/api/vendor/stock-locations/*` route set **or** plugin provider (`@mercurjs/b2c-core`) |

## Startup validation

Backend startup now includes `src/loaders/verify-vendor-inventory-contract.ts`.

Validation rule:

- For each critical endpoint, startup checks if either:
  - a local route provider file exists, or
  - `@mercurjs/b2c-core` is installed as a dependency.

If neither provider exists for any critical endpoint, startup fails with an explicit contract error.

## Operational recommendation

For production hardening, prefer one of the following deployment guarantees:

1. Explicit local routes for all three endpoint families, or
2. Pinned/validated `@mercurjs/b2c-core` version with compatibility checks in CI.
