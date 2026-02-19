# TODO Tracker

Generated from in-code `TODO`/`FIXME` markers in `admin-panel/src`, `storefront/src`, and `vendor-panel/src`.

**Open items:** 55

## Summary by area and severity

| App | Open Items | High | Medium | Low | Top Areas |
|---|---:|---:|---:|---:|---|
| admin-panel | 55 | 13 | 26 | 16 | `routes/orders` (28), `routes/products` (4), `hooks/table` (3) |
| storefront | 0 | 0 | 0 | 0 | — |
| vendor-panel | 0 | 0 | 0 | 0 | — |

## admin-panel (55)

### Area breakdown

| Area | Count |
|---|---:|
| `routes/orders` | 28 |
| `routes/products` | 4 |
| `hooks/table` | 3 |
| `routes/profile` | 3 |
| `components/layout` | 2 |
| `components/table` | 2 |
| `routes/locations` | 2 |
| `routes/workflow-executions` | 2 |
| `components/data-grid` | 1 |
| `components/search` | 1 |
| `hooks/api` | 1 |
| `hooks/use-date.tsx` | 1 |
| `routes/customers` | 1 |
| `routes/invite` | 1 |
| `routes/product-variants` | 1 |
| `routes/reservations` | 1 |
| `routes/tax-regions` | 1 |

### Items (sorted by severity → area → file)

| Status | Severity | Area | File | Line | Note |
|---|---|---|---|---:|---|
| ⬜ | High | `components/search` | `admin-panel/src/components/search/use-search-results.tsx` | 142 | // TODO: Remove the OR condition once the list endpoint does not throw when q equals an empty string |
| ⬜ | High | `routes/locations` | `admin-panel/src/routes/locations/location-service-zone-shipping-option-pricing/components/create-shipping-options-form/edit-shipping-options-pricing-form.tsx` | 171 | * TODO: If we try to update an existing region price the API throws an error. |
| ✅ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/add-claim-outbound-items-table/add-claim-outbound-items-table.tsx` | 64 | Inventory-based row selection validation implemented. |
| ⬜ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 538 | // TODO: fix this for inventory kits |
| ✅ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-item.tsx` | 70 | Max quantity now respects available managed inventory when present. |
| ⬜ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-section.tsx` | 260 | // TODO: Ensure inventory validation occurs correctly |
| ✅ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-edit/components/add-order-edit-items-table/add-order-edit-items-table.tsx` | 57 | Inventory-based row selection validation implemented. |
| ✅ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-exchange/components/add-exchange-outbound-items-table/add-exchange-outbound-items-table.tsx` | 64 | Inventory-based row selection validation implemented. |
| ✅ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-exchange/components/exchange-create-form/exchange-outbound-item.tsx` | 70 | Max quantity now respects available managed inventory when present. |
| ⬜ | High | `routes/orders` | `admin-panel/src/routes/orders/order-create-fulfillment/components/order-create-fulfillment-form/order-create-fulfillment-form.tsx` | 91 | // is_return: false, // TODO: 500 when enabled |
| ⬜ | High | `routes/orders` | `admin-panel/src/routes/orders/order-receive-return/order-receive-return.tsx` | 30 | }) // TODO: fix API needs to return 404 if return not exists and not an empty object |
| ⬜ | High | `routes/products` | `admin-panel/src/routes/products/product-create/components/product-create-organize-form/product-create-organize-form.tsx` | 25 | {/* TODO: WHERE DO WE SET PRODUCT ATTRIBUTES? -> the plan is to moved that to Inventory UI */} |
| ⬜ | High | `routes/tax-regions` | `admin-panel/src/routes/tax-regions/tax-region-metadata/tax-region-metadata.tsx` | 8 | * TODO: Tax region update endpoint is missing |
| ⬜ | Medium | `components/layout` | `admin-panel/src/components/layout/main-layout/main-layout.tsx` | 192 | // TODO: Enable when domin is introduced |
| ⬜ | Medium | `components/layout` | `admin-panel/src/components/layout/main-layout/main-layout.tsx` | 212 | // TODO: Enable when domin is introduced |
| ⬜ | Medium | `components/table` | `admin-panel/src/components/table/table-cells/order/fulfillment-status-cell/fulfillment-status-cell.tsx` | 18 | // TODO: remove this once fulfillment<>order link is added |
| ⬜ | Medium | `hooks/api` | `admin-panel/src/hooks/api/orders.tsx` | 79 | // TODO: enable when needed |
| ⬜ | Medium | `hooks/table` | `admin-panel/src/hooks/table/filters/use-order-table-filters.tsx` | 147 | // TODO: enable when Payment, Fulfillments <> Orders are linked |
| ⬜ | Medium | `hooks/table` | `admin-panel/src/hooks/table/query/use-shipping-option-table-query.tsx` | 47 | // TODO: not supported |
| ⬜ | Medium | `routes/customers` | `admin-panel/src/routes/customers/customer-detail/components/customer-order-section/customer-order-section.tsx` | 66 | {/*TODO: ENABLE WHEN DRAFT ORDERS ARE DONE*/} |
| ⬜ | Medium | `routes/invite` | `admin-panel/src/routes/invite/invite.tsx` | 40 | // TODO: Update to V2 format |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 108 | // TODO: implement confirm claim request |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 115 | // TODO: implement update claim request |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-item.tsx` | 19 | // TODO: create a payload type for outbound updates |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-section.tsx` | 64 | // TODO: filter in the API when boolean filter is supported and fulfillment module support partial rule SO filtering |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-exchange/components/exchange-create-form/exchange-outbound-item.tsx` | 19 | // TODO: create a payload type for outbound updates |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-exchange/components/exchange-create-form/exchange-outbound-section.tsx` | 63 | // TODO: filter in the API when boolean filter is supported and fulfillment module support partial rule SO filtering |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-return/components/return-create-form/return-create-form.tsx` | 116 | * TODO: this should accept filter for location_id |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-return/components/return-create-form/return-create-form.tsx` | 170 | * TODO: reason selection once Return reason settings are added |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-create-return/components/return-create-form/schema.ts` | 15 | // TODO: implement this |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-activity-section.tsx` | 19 | {/* TODO: Re-add when we have support for notes */} |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx` | 676 | * TODO: Add once notes are supported. |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx` | 794 | return acc + (isReceived ? item.received_quantity : item.quantity) // TODO: revisit when we add dismissed quantity on ReturnItem |
| ⬜ | Medium | `routes/orders` | `admin-panel/src/routes/orders/order-list/components/order-list-table/use-order-table-filters.tsx` | 57 | // TODO: Add payment and fulfillment status filters when they are properly linked to orders |
| ⬜ | Medium | `routes/products` | `admin-panel/src/routes/products/product-create/components/product-create-form/product-create-form.tsx` | 91 | * TODO: Important to revisit this - use variants watch so high in the tree can cause needless rerenders of the entire page |
| ⬜ | Medium | `routes/profile` | `admin-panel/src/routes/profile/profile-detail/components/profile-general-section/profile-general-section.tsx` | 65 | {/* TODO: Do we want to implement usage insights in V2? */} |
| ⬜ | Medium | `routes/profile` | `admin-panel/src/routes/profile/profile-edit/components/edit-profile-form/edit-profile-form.tsx` | 148 | {/* TODO: Do we want to implement usage insights in V2? */} |
| ⬜ | Medium | `routes/profile` | `admin-panel/src/routes/profile/profile-edit/components/edit-profile-form/edit-profile-form.tsx` | 175 | // TODO change link once docs are public |
| ⬜ | Medium | `routes/reservations` | `admin-panel/src/routes/reservations/reservation-detail/components/reservation-general-section/reservation-general-section.tsx` | 66 | value={reservation.line_item_id} // TODO fetch order instead + add link |
| ⬜ | Low | `components/data-grid` | `admin-panel/src/components/data-grid/components/data-grid-root.tsx` | 94 | * TODO: |
| ⬜ | Low | `components/table` | `admin-panel/src/components/table/data-table/data-table-root/data-table-root.tsx` | 66 | * TODO |
| ⬜ | Low | `hooks/table` | `admin-panel/src/hooks/table/query/use-shipping-option-table-query.tsx` | 44 | // TODO: We don't allow region_id in the API yet |
| ⬜ | Low | `hooks/use-date.tsx` | `admin-panel/src/hooks/use-date.tsx` | 7 | // TODO: We rely on the current language to determine the date locale. This is not ideal, as we use en-US for the english translation. |
| ⬜ | Low | `routes/locations` | `admin-panel/src/routes/locations/location-list/constants.ts` | 1 | // TODO: change this when RQ is fixed (address is not joined when *address) |
| ⬜ | Low | `routes/orders` | `admin-panel/src/routes/orders/order-allocate-items/components/order-create-fulfillment-form/order-allocate-items-form.tsx` | 99 | * TODO: we should have bulk endpoint for this so this is executed in a workflow and can be reverted |
| ⬜ | Low | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 565 | // TODO: add this on ESC press |
| ⬜ | Low | `routes/orders` | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/schema.ts` | 14 | item_id: z.string(), // TODO: variant id? |
| ⬜ | Low | `routes/orders` | `admin-panel/src/routes/orders/order-create-fulfillment/components/order-create-fulfillment-form/order-create-fulfillment-form.tsx` | 181 | } // else -> TODO: what if original shipping option is deleted? |
| ⬜ | Low | `routes/orders` | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx` | 1030 | * TODO: change original_email to customer info when action details is changed |
| ⬜ | Low | `routes/orders` | `admin-panel/src/routes/orders/order-detail/order-detail.tsx` | 41 | // TODO: Retrieve endpoints don't have an order ability, so a JS sort until this is available |
| ⬜ | Low | `routes/product-variants` | `admin-panel/src/routes/product-variants/product-variant-edit/components/product-edit-variant-form/product-edit-variant-form.tsx` | 44 | // TODO: Either pass option ID or make the backend handle options constraints differently to handle the lack of IDs |
| ⬜ | Low | `routes/products` | `admin-panel/src/routes/products/product-create-variant/components/create-product-variant-form/create-product-variant-form.tsx` | 128 | const isCurrentTabDirty = false // isTabDirty(tab) TODO |
| ⬜ | Low | `routes/products` | `admin-panel/src/routes/products/product-detail/components/product-sales-channel-section/product-sales-channel-section.tsx` | 12 | // TODO: The fetched sales channel doesn't contain all necessary info |
| ⬜ | Low | `routes/workflow-executions` | `admin-panel/src/routes/workflow-executions/workflow-execution-detail/components/workflow-execution-history-section/workflow-execution-history-section.tsx` | 203 | // TODO: Apply resolve value: packages/core/workflows-sdk/src/utils/composer/helpers/resolve-value.ts |
| ⬜ | Low | `routes/workflow-executions` | `admin-panel/src/routes/workflow-executions/workflow-execution-detail/components/workflow-execution-history-section/workflow-execution-history-section.tsx` | 227 | // TODO: Apply resolve value: packages/core/workflows-sdk/src/utils/composer/helpers/resolve-value.ts |

## storefront (0)

- No open TODO/FIXME markers.

## vendor-panel (0)

- No open TODO/FIXME markers.


## Audit-derived storefront follow-ups (manual)

The following open issues were identified in the storefront routes/links/pages audit and should be tracked until resolved:

| Status | Severity | Area | Item | Source |
|---|---|---|---|---|
| ⬜ | High | `storefront/routes` | Add route metadata to 20 pages missing `generateMetadata`/`metadata` exports (including `/sell`, `/collections/[handle]`, `/collective/demand-pools/[id]`, and account/password pages). | `storefront/docs/storefront-pages-audit.md` |
| ⬜ | High | `storefront/routes` | Add explicit `notFound()` handling to 10 dynamic routes missing fallback behavior (including `/collections/[handle]`, `/products/[handle]`, and `/user/orders/[id]` paths). | `storefront/docs/storefront-pages-audit.md` |
| ⬜ | Medium | `storefront/qa` | Add recurring static internal-link route validation in QA/release checks to detect unmatched hard-coded hrefs before release. | `storefront/docs/storefront-pages-audit.md` |

## Usage

- Check an item (`⬜` → `✅`) when completed.
- Remove the row once merged if you prefer a compact tracker.
- Re-generate by re-running: `rg -n "TODO|FIXME" admin-panel/src storefront/src vendor-panel/src`.
- Severity buckets are heuristic and based on TODO/FIXME comment text.
