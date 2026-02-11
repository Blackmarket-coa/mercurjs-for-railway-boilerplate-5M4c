# Vendor Panel Products Display Source Review (with Admin/Storefront Comparison)

## Scope
This review covers the vendor-panel sources responsible for product-list display and compares the architecture against the existing admin-panel and storefront product-display implementations.

Primary vendor-panel files reviewed:

- Route wiring:
  - `vendor-panel/src/providers/router-provider/route-map.tsx`
  - `vendor-panel/src/routes/products/product-list/index.ts`
  - `vendor-panel/src/routes/products/product-list/product-list.tsx`
- Product list table + loader:
  - `vendor-panel/src/routes/products/product-list/components/product-list-table/product-list-table.tsx`
  - `vendor-panel/src/routes/products/product-list/loader.ts`
- Product data/filter/query hooks:
  - `vendor-panel/src/hooks/api/products.tsx`
  - `vendor-panel/src/hooks/table/query/use-product-table-query.tsx`
  - `vendor-panel/src/hooks/table/filters/use-product-table-filters.tsx`
  - `vendor-panel/src/hooks/table/columns/use-product-table-columns.tsx`
- Product table cells:
  - `vendor-panel/src/components/table/table-cells/product/product-cell/product-cell.tsx`
  - `vendor-panel/src/components/table/table-cells/product/category-cell/category-cell.tsx`
  - `vendor-panel/src/components/table/table-cells/product/collection-cell/collection-cell.tsx`
  - `vendor-panel/src/components/table/table-cells/product/variant-cell/variant-cell.tsx`
  - `vendor-panel/src/components/table/table-cells/product/product-status-cell/product-status-cell.tsx`

Reference docs for alignment:

- `docs/ADMIN_PRODUCTS_DISPLAY_REVIEW.md`
- `docs/STOREFRONT_PRODUCTS_DISPLAY_REVIEW.md`

## How Vendor Products Display Is Wired

1. Vendor router maps `/products` to a nested product route tree with list/create/import/export and product-detail children.
2. The list route mounts `ProductList`, which wraps `ProductListTable` in `SingleColumnPage` with extension widget slots (`product.list.before/after`).
3. `ProductListTable` uses `_DataTable` (single implementation path; no configurable-table feature-flag branch in this route).

## Vendor List Display Flow

- Query state is parsed by `useProductTableQuery` (offset/order/search/date/status/category/collection/type/tag).
- Product data comes from `useProducts(...)`, which calls `GET /vendor/products` via `fetchQuery`.
- Table setup includes:
  - pagination (page size = 10)
  - row selection with select-all checkbox
  - search + filters + ordering
  - row navigation to product detail
- Bulk delete command (`d`) is wired through `useBulkDeleteProducts`, which sends one `DELETE /vendor/products/:id` per selected product.
- Row action menu supports single delete through `useDeleteProduct`.
- Loader prefetches first page from `/vendor/products` with explicit fields (`+thumbnail,*categories,+status`) to hydrate initial render.

## Vendor Table Columns and Filters

### Columns

Vendor product list columns are currently:

1. Product (thumbnail + title)
2. Category (joined category names)
3. Collection
4. Variants count
5. Status badge
6. Actions

Compared to admin, vendor includes **category** in the default list, while admin includes **sales channels** instead.

### Filters

Vendor filters include:

- product type (`type_id`)
- tag (`tagId`)
- category (`category_id`)
- collection (`collection_id`)
- status

Notable contrast with admin vendor-adjacent behavior: vendor filter UI includes category/collection, whereas admin legacy products list leaves these commented out in filter controls.

## Vendor Display Behavior Notes

- Route uses `location.search` for export link but does not use `useLocation`; this relies on global `window.location` at runtime and is less explicit than admin’s `useLocation` usage.
- `useProductTableQuery` uses `tagId` key (camel-case) while admin commonly uses `tag_id`; this divergence may affect URL/query interoperability across panels.
- In query type extension, `categoryId`/`collectionId`/`typeId` are declared but request object uses `category_id`/`collection_id`/`type_id`; this is mostly typing noise but signals naming inconsistency.
- Vendor list page size is 10 vs admin’s 20, so list density/performance tradeoffs differ by panel.
- Bulk delete performs N independent deletes rather than a dedicated backend batch endpoint.

## Admin vs Vendor vs Storefront Comparison

| Area | Admin Panel | Vendor Panel | Storefront |
|---|---|---|---|
| Primary objective | Platform-wide catalog operations | Seller-scoped catalog management | Shopper catalog discovery |
| Main list UI | Table (`_DataTable`) + optional configurable table path | Table (`_DataTable`) only | Card/grid listing |
| Dual-path behavior | Legacy vs configurable list via feature flag | No dual table path in reviewed route | Medusa listing vs Algolia listing |
| Data source | Admin product endpoints (`sdk.admin.product.*`) | Vendor product endpoints (`/vendor/products`) | Store product endpoints + optional Algolia |
| Default list emphasis | Product/collection/sales channels/variants/status | Product/category/collection/variants/status | Product card media/title/price/seller |
| Bulk delete | Yes (single + bulk) | Yes (single + bulk, iterative deletes) | No list-level delete |
| Query/filter conventions | snake_case (`tag_id`, etc.) | mixed (`tagId` + snake_case fields) | URL params + search facets |
| Typical risk | feature-flag parity drift | naming/API consistency + operational delete strategy | search/fallback parity + SEO |

## Recommendations

1. Normalize query parameter naming between admin/vendor (`tag_id` vs `tagId`) to reduce mental and integration overhead.
2. Replace iterative bulk deletes with a backend-supported batch delete endpoint when available (or wrap current fan-out in clearer progress/error reporting).
3. Consider using `useLocation()` consistently in vendor list route links for clarity and SSR safety expectations.
4. Document canonical differences between admin and vendor product columns (sales-channel-centric vs category-centric) so UX divergence is intentional.
5. Keep this doc aligned with `ADMIN_PRODUCTS_DISPLAY_REVIEW.md` and `STOREFRONT_PRODUCTS_DISPLAY_REVIEW.md` during release audits.
