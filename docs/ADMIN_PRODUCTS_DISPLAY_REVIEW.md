# Admin Products Display Source Review

## Scope
This review covers the admin route and UI sources responsible for rendering the **Products list display** in the admin panel.

Primary files reviewed:

- Routing entry: `admin-panel/src/dashboard-app/routes/get-route.map.tsx`
- List route: `admin-panel/src/routes/products/product-list/*`
- Product API/query/filter hooks:
  - `admin-panel/src/hooks/api/products.tsx`
  - `admin-panel/src/hooks/table/query/use-product-table-query.tsx`
  - `admin-panel/src/hooks/table/filters/use-product-table-filters.tsx`
- Table column renderers:
  - `admin-panel/src/hooks/table/columns/use-product-table-columns.tsx`
  - `admin-panel/src/components/table/table-cells/product/*`
- Configurable-table path:
  - `admin-panel/src/routes/products/product-list/components/product-list-table/configurable-product-list-table.tsx`
  - `admin-panel/src/routes/products/product-list/components/product-list-table/product-table-adapter.tsx`
  - `admin-panel/src/routes/products/product-list/components/product-list-table/use-product-table-filters.tsx`
  - `admin-panel/src/lib/table/entity-adapters.tsx`

## How Products Display Is Wired

1. Route `"/products"` lazy-loads `product-list` under the protected main layout.
2. `ProductList` renders a single-column page wrapper and mounts `ProductListTable`.
3. `ProductListTable` chooses implementation by feature flag:
   - **Legacy table path** (`_DataTable`) when `view_configurations` is disabled.
   - **Configurable table path** (`ConfigurableDataTable`) when enabled.

## Legacy Table Display Flow

- Initial list state is prefetched via `productsLoader` (20 items, non-gift-card products).
- URL query params are parsed by `useProductTableQuery` and mapped into Medusa list params.
- Data comes from `useProducts(...)`, with `keepPreviousData` for pagination/filter transitions.
- Table columns are built from:
  - Select checkbox
  - Product (thumbnail + title)
  - Collection
  - Sales channels
  - Variants count
  - Status
  - Row actions (edit/delete)
- Supports bulk selection + bulk delete command and per-row action menu.

## Configurable Table Display Flow

- `ConfigurableProductListTable` uses `useProductTableAdapter()`.
- Adapter defines:
  - entity key: `products`
  - query prefix: `p`
  - page size: 20
  - row href: `/products/:id`
  - `columnAdapter`: `productColumnAdapter`
  - data source: `useProducts(fields, params)` with `is_giftcard: false`
- Filters for configurable table are built via `createDataTableFilterHelper`:
  - created/updated date filters
  - product type/tag/sales channel multiselects
  - status multiselect
- Bulk delete command is retained in configurable mode.

## Display Behavior Notes

- Both paths intentionally exclude gift cards (`is_giftcard: false`).
- Legacy table exposes explicit order-by options (`title`, `created_at`, `updated_at`), while configurable ordering depends on table/view config.
- Sales channel cell truncates after 2 channels and shows `+N more` in tooltip.
- Variant count in legacy path is localized via translation key; configurable path formats variants count in the entity adapter.

## Potential Gaps / Risks

1. **Dual implementations increase drift risk**
   - There are two independent products-list display pipelines with separate filters/rendering logic.
   - Any future change to columns/filters/actions must be mirrored or guarded by feature-flag policy.

2. **Legacy query supports filters not exposed in legacy UI**
   - Query parser supports `category_id` and `collection_id`, but corresponding legacy filter controls are commented out.
   - Deep-linked URLs may work, but discoverability in UI is reduced.

3. **Configurable adapter uses internal `placeholderData` introspection**
   - It inspects `previousQuery?.[...].query?.fields` shape to decide placeholder reuse.
   - This may be brittle if react-query internals/query-key shape changes.

4. **Inconsistent variants-count formatting between paths**
   - Legacy path uses i18n translation (`products.variantCount`).
   - Configurable adapter currently builds plain English string (`"variant"/"variants"`).

## Recommendations

1. Define an explicit deprecation timeline for legacy table path once configurable views are stable.
2. Decide whether category/collection filters should be restored in legacy UI or removed from query parsing for consistency.
3. Move configurable variants count formatting to translated copy to align with localization behavior.
4. Harden adapter placeholder logic by deriving field changes from explicit query key construction instead of internal query object shape.
5. Add a short architecture note near the route explaining why both list implementations exist and which one is canonical.
