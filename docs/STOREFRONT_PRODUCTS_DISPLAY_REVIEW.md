# Storefront Products Display Source Review (with Admin Comparison)

## Scope
This review covers the storefront sources that render product-list displays and compares the implementation with the admin products list architecture.

Primary storefront files reviewed:

- Product-list section components:
  - `storefront/src/components/sections/ProductListing/ProductListing.tsx`
  - `storefront/src/components/sections/ProductListing/AlgoliaProductsListing.tsx`
- Data fetching / sorting:
  - `storefront/src/lib/data/products.ts`
- Product list/card/pagination/filter UI:
  - `storefront/src/components/organisms/ProductsList/ProductsList.tsx`
  - `storefront/src/components/organisms/ProductCard/ProductCard.tsx`
  - `storefront/src/components/organisms/ProductListingHeader/ProductListingHeader.tsx`
  - `storefront/src/components/organisms/ProductSidebar/ProductSidebar.tsx`
  - `storefront/src/components/organisms/ProductListingActiveFilters/ProductListingActiveFilters.tsx`
  - `storefront/src/components/organisms/ProductsPagination/ProductsPagination.tsx`
- Route entry points that mount listing flows:
  - `storefront/src/app/[locale]/(main)/categories/[category]/page.tsx`
  - `storefront/src/app/[locale]/(main)/collections/[handle]/page.tsx`
  - `storefront/src/components/organisms/SellerTabs/SellerTabs.tsx`

Reference admin files for comparison:

- `admin-panel/src/routes/products/product-list/product-list.tsx`
- `admin-panel/src/routes/products/product-list/components/product-list-table/product-list-table.tsx`
- `admin-panel/src/routes/products/product-list/components/product-list-table/configurable-product-list-table.tsx`
- `admin-panel/src/routes/products/product-list/components/product-list-table/product-table-adapter.tsx`

## How Storefront Products Display Is Wired

1. Product-list pages (category, collection, seller tab) use a **dual display path**:
   - `ProductListing` (Medusa-backed server listing)
   - `AlgoliaProductsListing` (Algolia search + Medusa hydration)
2. Runtime selection is environment/bot-driven:
   - Category/collection pages choose Medusa path for bots or when Algolia env vars are absent.
   - Seller tab chooses Algolia path when env vars are present.
3. Shared card rendering is performed by `ProductCard`, fed through `ProductsList` (server path) or mapped hits (Algolia path).

## Storefront Display Flows

### A) Medusa-backed listing (`ProductListing`)

- Calls `listProductsWithSort(...)` with `page`, seller/category/collection constraints, and fixed `sortBy: "created_at"`.
- `listProductsWithSort` internally fetches up to 100 products via `listProducts`, sorts in memory, then slices for pagination.
- Renders:
  - listing count via `ProductListingHeader`
  - active URL filters strip
  - optional sidebar (`ProductSidebar`)
  - `ProductsList` (maps to `ProductCard`)
  - `ProductsPagination`

### B) Algolia-backed listing (`AlgoliaProductsListing`)

- Builds Algolia filter expression from URL params, seller/category/collection constraints, and suspended-seller exclusion.
- Executes search via `InstantSearchNext` + `<Configure .../>`.
- Hydrates Algolia hits with Medusa product details using `listProducts({ handle: [...] })`.
- Applies client-side currency-aware min/max price filtering and renders cards/pagination.

## Display Behavior Notes (Storefront)

- Suspended sellers are excluded in both paths:
  - Medusa path filters `seller.store_status !== "SUSPENDED"` in `listProducts`.
  - Algolia path adds `NOT seller.store_status:SUSPENDED` filter.
- Product card supports two visual variants:
  - default
  - producer-forward (seller-first emphasis)
- Header sort UI exists but is commented out in `ProductListingHeader`, while backend helper still supports sorting strategies.
- Non-Algolia sidebar currently appears effectively non-functional for users (an always-visible overlay message indicates Algolia setup is required).

## Admin vs Storefront Comparison

| Area | Admin Products Display | Storefront Products Display |
|---|---|---|
| Primary objective | Back-office data management table (bulk ops, edit/delete, row actions) | Customer-facing catalog browsing and discovery |
| Main route shape | `/products` in dashboard route map | Category/collection/seller pages under `app/[locale]/(main)` |
| Dual implementation | Legacy `_DataTable` vs `ConfigurableDataTable` via feature flag | Medusa listing vs Algolia listing via env + bot logic |
| Data source | Admin API (`sdk.admin.product.list`) with react-query caching | Store API (`/store/products`) + optional Algolia search + Medusa hydration |
| Interaction model | Table columns, filters, row selection, bulk commands | Grid cards, sidebar facets, active chips, pagination |
| Deletion/mutations | Directly supported in list (single + bulk delete) | No list-level product mutations |
| Gift-card handling | Explicitly excluded (`is_giftcard: false`) | No equivalent storefront gift-card exclusion in listing helper |
| i18n/localization sensitivity | Strong in table labels/status cells | Locale-aware routing; mixed hardcoded labels in listing UI |

## Cross-App Similarities

1. Both apps currently maintain **two parallel product-list implementations**, increasing drift risk.
2. Both use centralized product data helpers/hooks to feed list UIs.
3. Both include conditional logic that can alter user-visible behavior by runtime flags/config.

## Cross-App Differences That Matter

1. **Switch trigger semantics differ**
   - Admin switch is feature-flag driven (`view_configurations`).
   - Storefront switch is environment + crawler-aware and varies by page type.

2. **Data shaping differs**
   - Admin mainly adjusts table fields/filter params for one API source.
   - Storefront Algolia path requires a second fetch to hydrate hits with Medusa pricing/seller data.

3. **Operational risk differs**
   - Admin risk centers on business workflows (bulk actions/filters parity).
   - Storefront risk centers on search relevance, SEO parity, and listing consistency across fallback paths.

## Recommendations

1. Define a canonical long-term path for storefront listing (Medusa-only vs Algolia-first) per route type, similar to admin deprecation planning.
2. Align sorting UX and behavior:
   - either re-enable sorting controls in `ProductListingHeader`
   - or remove dormant sort plumbing to reduce false affordances.
3. Clarify/guard non-Algolia sidebar behavior so users do not see contradictory filter UI states.
4. Add parity checks for category/collection/seller listing counts between Medusa and Algolia paths to detect drift early.
5. Standardize comparison notes in docs so admin/storefront product-display architecture can be reviewed together during releases.

## Dual-Path Deep Dive: Why Products Can Appear in Admin/Vendor but Not Storefront

This section documents concrete divergence points observed in source that directly impact product visibility.

### 1) Different systems of record per surface

- Admin panel list reads from admin APIs (`sdk.admin.product.list`).
- Vendor panel list reads from vendor APIs (`/vendor/products`).
- Storefront reads from store APIs (`/store/products`) and optionally Algolia index (`products`) + store hydration.

Because these are different read paths, product visibility can diverge when publication/indexing/state rules differ.

### 2) Storefront Medusa path fetches max 100 before local pagination

- `listProductsWithSort` fetches with `limit: 100` then sorts/slices in memory.
- Products outside that first 100 fetched records are invisible in this path, even if present in admin/vendor.

### 3) Storefront Algolia path is effectively a 2-stage filter

- Stage A: Algolia index hit must exist and satisfy Algolia filter expression.
- Stage B: hit is retained only if matching Medusa product hydration succeeds and currency/price checks pass.

So products can be dropped if:

- index is stale/missing seller/category linkage
- hydration lookup by handle returns no matching store product
- product variants do not satisfy currency/min/max checks

### 4) Seller suspension exclusion is storefront-only business filtering

- Storefront excludes suspended sellers in both Medusa and Algolia paths.
- Admin/vendor list routes do not apply this storefront exclusion in their product list display logic.

### 5) Count semantics differ between paths

- In Medusa path, `filteredCount` is currently assigned the upstream `count` even after seller-status filtering.
- In Algolia path, display count is derived from filtered current-page products while pagination uses Algolia `nbPages`.

These differences can produce confusing "count/pagination vs visible cards" behavior.

## Focused Debug Checklist for "All Products" / Category Gaps

1. Verify runtime path selected on the affected request (bot/env chooses Medusa vs Algolia).
2. For Algolia path, confirm product exists in `products` index with expected category/seller facets.
3. Confirm store product retrieval by handle returns the product in the same locale/region context.
4. Check seller `store_status` and storefront currency filters for unintended exclusion.
5. If Medusa path is active, test whether affected products fall outside the first 100 fetched rows.
