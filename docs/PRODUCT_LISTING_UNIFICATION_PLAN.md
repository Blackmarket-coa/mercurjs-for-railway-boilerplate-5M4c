# Product Listing Unification Plan (Option 4)

## Objective
Implement a single canonical product-listing service for storefront discovery so that product visibility semantics are consistent and explainable across:

- Admin panel (operations view)
- Vendor panel (seller management view)
- Storefront (buyer discovery view)

This plan targets elimination of storefront dual-path drift (Medusa listing vs Algolia listing) while preserving search performance and filter UX.

## Problem Summary
Today, storefront listing behavior diverges due to two independently executed paths:

1. Medusa-backed listing (`ProductListing` + `listProductsWithSort`)
2. Algolia-backed listing (`AlgoliaProductsListing` + Medusa hydration)

Both paths apply different filtering/count/pagination semantics and can return different card sets for the same user intent.

## Target Architecture

### 1) Canonical Listing Domain Service
Create a single server-side listing module (e.g. `storefront/src/lib/listing/unified-products.ts`) with this contract:

```ts
export type UnifiedProductListInput = {
  locale: string
  page: number
  limit: number
  query?: string
  sellerHandle?: string
  categoryId?: string
  collectionId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: "created_at" | "price_asc" | "price_desc"
}

export type UnifiedProductListResult = {
  products: StoreProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  source: "search-index" | "store-api"
  diagnostics?: {
    droppedByHydration: number
    droppedByCurrencyFilter: number
    droppedByPolicy: number
  }
}
```

### 2) Provider Adapters (Internal)
The domain service can call adapters, but adapters are hidden from route components:

- `searchIndexProvider` (Algolia adapter)
- `storeApiProvider` (Medusa `/store/products` adapter)

Domain layer owns the selection/fallback strategy and normalizes outputs.

### 3) Unified Policy Engine
Centralize business rules once:

- seller suspension rule
- publication/status eligibility
- region/currency compatibility
- category/collection membership requirements

Policy must run for both providers and emit diagnostics counters.

### 4) Shared Count/Pagination Semantics
`total` must always represent items *after* policy filtering and be consistent with rendered list.

No route-level count derivation from mixed data sources.

## Implementation Phases

## Phase 0 — Baseline & Observability (1-2 days)
1. Add debug logging (server-side only) for current storefront paths:
   - selected path
   - total upstream hits
   - hydrated hits
   - post-policy hits
2. Capture baseline mismatch examples (product IDs missing in storefront but present in admin/vendor).
3. Define parity dashboard metrics:
   - `listing_discrepancy_count`
   - `hydration_drop_rate`
   - `index_missing_rate`

**Exit criteria:** reproducible discrepancy dataset with at least 10 known cases.

## Phase 1 — Build Unified Domain Service (2-4 days)
1. Implement input validation + normalization.
2. Implement provider adapters and normalization mappers.
3. Implement shared policy engine and diagnostics counters.
4. Implement deterministic fallback policy:
   - primary provider configurable by env
   - fallback on timeout/error
   - same post-filter semantics regardless of source.

**Exit criteria:** service returns identical shape for both provider routes.

## Phase 2 — Wire Storefront Pages to Unified Service (2-3 days)
Replace direct usage in:

- `categories/page.tsx` all-products section
- `categories/[category]/page.tsx`
- `collections/[handle]/page.tsx`
- seller product tab listing

All these routes should consume only the unified service result.

**Exit criteria:** no direct route-level branching between `ProductListing` and `AlgoliaProductsListing` for primary list views.

## Phase 3 — Remove Legacy Dual Path Components (1-2 days)
1. Deprecate and remove duplicate listing entry components or keep as thin wrappers around unified service.
2. Remove duplicated count/filter/pagination logic.
3. Keep adapter modules isolated for backend/provider swaps.

**Exit criteria:** single canonical listing pipeline in storefront.

## Phase 4 — Rollout & Safeguards (2-3 days)
1. Introduce feature flag `storefront_unified_listing`.
2. Roll out by locale/traffic cohort.
3. Track parity and conversion metrics.
4. Add kill-switch rollback to prior behavior for incident response.

**Exit criteria:** full rollout with no critical mismatch regressions.

## Data and API Decisions

## Canonical filter keys
Standardize to snake_case externally and internally:

- `category_id`
- `collection_id`
- `seller_handle`
- `min_price`
- `max_price`
- `sort_by`

## Sort behavior
Move sorting to provider/query whenever possible; avoid fetching large windows for local sort.

If local sort is unavoidable, use cursor/batch fetching and enforce deterministic full-set ordering with bounded memory.

## Currency/price filtering
Run once in policy layer with clear rules:

- include product only if at least one sellable variant exists for active currency
- apply min/max thresholds on normalized amounts

## Testing Plan

## Unit tests
1. Policy engine cases:
   - suspended seller exclusion
   - missing variants/currency mismatch
   - category/collection match logic
2. Pagination and total count correctness.
3. Fallback behavior when primary provider fails.

## Integration tests
1. Same query through both adapters yields equivalent final output after normalization/policy.
2. Known missing-product fixtures now consistently appear or consistently excluded with reason codes.

## End-to-end checks
1. `/categories` all-products list parity with expected fixtures.
2. `/categories/[category]` list parity.
3. `/collections/[handle]` list parity.
4. seller tab listing parity.

## Risks and Mitigations

1. **Risk:** performance regression if unified layer over-fetches.
   - **Mitigation:** provider-side paging/filtering first, capped fallback fetches, profiling before rollout.

2. **Risk:** index/store lag still causes edge divergence.
   - **Mitigation:** explicit fallback policy + diagnostics + periodic reconciliation job.

3. **Risk:** business-rule ambiguity (e.g., seller suspension expectations).
   - **Mitigation:** codify policy in one module with tests and product/legal sign-off.

## Deliverables

1. `UnifiedProductListingService` module + provider adapters.
2. Storefront routes switched to unified service.
3. Feature-flagged rollout plan and runbook.
4. Test suite (unit + integration + smoke checklist).
5. Updated architecture docs replacing dual-path references.

## Recommended Ownership

- **Tech lead:** storefront platform engineer
- **Contributors:** search/index owner, backend Medusa owner, QA
- **Reviewers:** admin/vendor panel owner (for cross-surface policy alignment)

## Timeline (suggested)
- Week 1: Phase 0 + Phase 1
- Week 2: Phase 2 + Phase 3
- Week 3: Phase 4 rollout and stabilization
