# Vendor Inventory Management & Tracking Analysis

**Date:** 2026-02-14  
**Scope:** `vendor-panel/src` + `backend/src` vendor inventory-related paths  
**Audience:** Product, engineering, operations

---

## 1) Executive summary

The platform has a **strong inventory surface area** in the vendor panel (inventory list/detail, stock editing by location, reservations visibility, and variant-level inventory linking), but its current implementation is **partially fragmented** between:

1. standard Medusa inventory flows,
2. vendor-scoped API paths, and
3. domain-specific inventory models (e.g., farm lots, archetype strategies, Woo sync).

The biggest risks are:

- **Potential API contract drift** between vendor panel expectations (`/vendor/inventory-items`, `/vendor/reservations`, `/vendor/stock-locations`) and explicit backend route implementations in this repository.
- **Cross-vendor data safety risk** in Woo sync workflow product discovery (comment says seller scoping, implementation appears global filter by metadata only).
- **Inconsistent inventory strategy governance** across archetype-driven products vs operational inventory UI behavior.

Overall maturity: **medium-high functional breadth**, **medium operational reliability**.

---

## 2) Current architecture (what exists today)

## 2.1 Vendor panel capabilities

The vendor panel includes a full inventory domain with:

- Inventory list route (`/inventory`) and nested workflows for create, stock batch editing, and detail views.
- Inventory detail sections covering:
  - general data,
  - location-level quantities,
  - reservation records,
  - linked variants,
  - item attributes.
- Product-level stock bulk editing that constructs create/update/delete payloads for inventory location levels.

Observations:

- The UX appears modeled after Medusa admin inventory patterns but served under vendor namespace.
- Vendor navigation gates inventory visibility via feature flags (`hasInventory`), allowing vendor-type customization.

## 2.2 Backend vendor surface

In this repo, explicit vendor routes exist for products, farm lots/harvests, deliveries, Woo/Printful integrations, etc.

However, there are **no explicit `backend/src/api/vendor/inventory-items/*` or `.../reservations/*` route files** in this codebase, despite heavy frontend usage of those paths.

This implies at least one of:

- these routes are provided by an external/plugin layer (likely MercurJS/B2C Core),
- routes are dynamically mounted elsewhere,
- or vendor panel calls may fail in certain deployments if plugin wiring diverges.

## 2.3 Data/control model related to inventory

The system blends multiple inventory paradigms:

- **Standard SKU inventory** (location levels, reservations).
- **Lot-based agricultural supply** (`lot.quantity_available`, `quantity_reserved`) with an optional sync workflow to Medusa inventory levels.
- **Archetype-level strategy metadata** (`STANDARD`, `LOT_BASED`, `UNLIMITED`, `CAPACITY`, `NONE`) that can alter expected inventory behavior.
- **External source-of-truth sync** (WooCommerce periodic/manual sync).

This is powerful but requires stronger governance to avoid contradictory states.

---

## 3) End-to-end tracking flows (as implemented)

## 3.1 Manual inventory operations (vendor UI)

1. Vendor opens inventory list and fetches `/vendor/inventory-items`.
2. Vendor navigates to detail and fetches expanded fields including variants + location levels + quantities.
3. Vendor edits stock at product or inventory-item level.
4. Frontend computes delta payloads (`create`, `update`, `delete`) and sends batch location-level operations to vendor inventory endpoints.
5. Queries invalidate across inventory and variants to refresh visible state.

Strengths:

- Delta-based updates reduce accidental wholesale overwrites.
- Disabled toggles consider incoming/reserved quantities to prevent dangerous deactivation.

Gaps:

- Some flows still use admin SDK calls directly (e.g., create/delete inventory item), while others use vendor endpoints; this can create auth/scope inconsistencies.

## 3.2 Reservation tracking

1. Detail screen loads reservations by querying `/vendor/reservations`.
2. Results are filtered for the current inventory item.
3. Location metadata is joined client-side from stock location query.

Strengths:

- Reservation visibility is embedded in inventory detail, improving explainability for “why stock is unavailable”.

Gaps:

- Client-side filtering after list fetch can cause unnecessary payload volume and weaker server-side authorization guarantees if backend query handling is broad.

## 3.3 Agricultural lot inventory sync

There is a dedicated `sync-lot-inventory` workflow that:

- retrieves lot available/reserved quantities,
- resolves linked inventory item for a variant,
- updates inventory levels (`stocked = available + reserved`, `reserved = reserved`).

Strengths:

- Explicit mapping between lot semantics and Medusa level quantities.

Gaps:

- Lot-to-product link route currently only logs intent for `sync_inventory` instead of invoking sync workflow in that path.
- Error handling in sync step returns “update_failed” but lacks richer remediation telemetry.

## 3.4 WooCommerce inventory sync

Manual and scheduled sync exist.

Strengths:

- Supports both immediate vendor-triggered sync and daily cron sync.
- Stores sync reports (`products_checked`, `variants_updated`, `out_of_stock`, `errors`) for observability.

Critical gap:

- Workflow comments state seller filtering, but product fetch appears globally broad and then filtered by metadata presence; seller ownership constraints are not obvious in that step.

---

## 4) Risk analysis

## 4.1 High-risk

1. **Route-contract dependency risk**: vendor panel assumes vendor inventory/reservation routes that are not explicitly implemented in this repo tree.
2. **Potential cross-tenant contamination risk in Woo sync** if seller scoping is not enforced before inventory adjustments.
3. **Mixed admin vs vendor clients in frontend hooks** can bypass intended vendor boundary semantics in some deployments.

## 4.2 Medium-risk

1. **Inventory strategy divergence**: archetype metadata can indicate no/alternate tracking, while UI routes still expose generic inventory controls.
2. **Client-side filtering patterns** for reservations/locations can become expensive and less secure at scale.
3. **Partial lot-sync integration**: endpoint path not fully wired to workflow call where user intent is declared.

## 4.3 Low-risk / technical debt

1. Inconsistent API query usage (defined table query params not always fully passed).
2. Limited standardized domain events for inventory adjustments across subsystems.

---

## 5) Recommended improvements (prioritized)

## P0 (immediate)

1. **Create and publish a vendor inventory contract map**
   - Explicitly document which `/vendor/*` inventory/reservation routes are provided by this repo vs plugin.
   - Add startup health check that asserts route availability for critical vendor inventory endpoints.

2. **Enforce seller scoping in Woo sync workflow query layer**
   - Join/filter by seller-product link prior to inventory mutations.
   - Add hard assertions and skip logs for ownership mismatch.

3. **Normalize frontend inventory hooks to vendor-only API access path**
   - Remove remaining direct `sdk.admin.inventoryItem.*` calls from vendor panel code paths unless explicitly intended and scoped.

## P1 (near-term)

1. **Wire lot-link route `sync_inventory` flag to actual workflow invocation**
   - Trigger `syncLotInventoryWorkflow` when variant+location context exists.

2. **Server-side filtering hardening**
   - Ensure reservation/inventory list endpoints always support seller- and item-scoped filtering server-side, minimizing client-side post-filtering.

3. **Inventory strategy-aware UI controls**
   - Hide/disable generic stock controls for archetypes with `UNLIMITED`, `NONE`, or non-standard strategies unless explicitly mapped.

## P2 (ongoing)

1. **Observability upgrades**
   - Emit structured domain events for stock adjustments, reservation changes, and sync outcomes.
   - Add per-vendor inventory drift dashboard (expected vs actual over time).

2. **Data quality guardrails**
   - Add reconciliation job comparing:
     - inventory levels,
     - reservation totals,
     - lot availability,
     - external (Woo) quantities where connected.

---

## 6) Suggested KPIs for vendor inventory tracking

- **Inventory accuracy rate** = % SKUs where displayed available quantity matches fulfillment reality.
- **Reservation leakage rate** = stale reservations / total reservations.
- **Cross-source drift score** = absolute difference between lot, inventory level, and external source quantities.
- **Sync reliability**:
  - manual sync success rate,
  - scheduled sync success rate,
  - median time to convergence.
- **Adjustment auditability** = % adjustments with actor, source, reason, and before/after values.

---

## 7) Practical implementation plan (30/60/90 days)

## 30 days

- Route contract registry + smoke tests for vendor inventory endpoints.
- Woo sync seller-scoping patch and regression tests.
- Remove/replace admin SDK usage in vendor inventory item create/delete hooks.

## 60 days

- Lot-link `sync_inventory` workflow integration.
- Strategy-aware inventory UI toggles.
- Reservation endpoint hardening + server-side paging/filter consistency checks.

## 90 days

- Unified inventory audit log stream.
- Drift reconciliation batch with alerting.
- Vendor-facing “inventory health” widget in dashboard.

---

## 8) Conclusion

Vendor inventory management in this codebase is feature-rich and close to enterprise-grade in breadth, but reliability hinges on tightening **tenant scoping, route-contract clarity, and strategy-aware consistency** across standard SKU, lot-based, and external-sync inventory domains.

If the P0 actions are completed, the platform should materially reduce operational risk while preserving current flexibility for diverse vendor types (producers, makers, mutual aid, etc.).

---

## 9) Implementation status update (completed)

The following recommendations have now been implemented in code:

- ✅ Seller-scoped Woo sync query path and workflow input hardening.
- ✅ Lot-link route invokes `syncLotInventoryWorkflow` and validates required `location_id`.
- ✅ Lot-link route seller ownership check now validates product association via `seller_product`.
- ✅ Reservation list querying now forwards `inventory_item_id` in the server request query.
- ✅ Product stock management applies strategy-aware disable behavior for non-trackable inventory strategies.
- ✅ Structured sync/reconciliation observability via workflow/route/job logging.
- ✅ Daily inventory reconciliation scheduled job for drift/anomaly detection.
