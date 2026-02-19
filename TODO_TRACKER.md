# TODO Tracker

Generated from in-code `TODO`/`FIXME` markers in `admin-panel/src`, `storefront/src`, and `vendor-panel/src`.

**Open items:** 60

## admin-panel (60)

| Status | File | Line | Note |
|---|---|---:|---|
| ⬜ | `admin-panel/src/components/data-grid/components/data-grid-root.tsx` | 94 | * TODO: |
| ⬜ | `admin-panel/src/components/layout/main-layout/main-layout.tsx` | 192 | // TODO: Enable when domin is introduced |
| ⬜ | `admin-panel/src/components/layout/main-layout/main-layout.tsx` | 212 | // TODO: Enable when domin is introduced |
| ⬜ | `admin-panel/src/components/search/use-search-results.tsx` | 142 | // TODO: Remove the OR condition once the list endpoint does not throw when q equals an empty string |
| ⬜ | `admin-panel/src/components/table/data-table/data-table-root/data-table-root.tsx` | 66 | * TODO |
| ⬜ | `admin-panel/src/components/table/table-cells/order/fulfillment-status-cell/fulfillment-status-cell.tsx` | 18 | // TODO: remove this once fulfillment<>order link is added |
| ⬜ | `admin-panel/src/hooks/api/orders.tsx` | 79 | // TODO: enable when needed |
| ⬜ | `admin-panel/src/hooks/api/promotions.tsx` | 18 | // TODO: handle invalidations properly |
| ⬜ | `admin-panel/src/hooks/table/filters/use-order-table-filters.tsx` | 147 | // TODO: enable when Payment, Fulfillments <> Orders are linked |
| ⬜ | `admin-panel/src/hooks/table/query/use-shipping-option-table-query.tsx` | 44 | // TODO: We don't allow region_id in the API yet |
| ⬜ | `admin-panel/src/hooks/table/query/use-shipping-option-table-query.tsx` | 47 | // TODO: not supported |
| ⬜ | `admin-panel/src/hooks/use-date.tsx` | 7 | // TODO: We rely on the current language to determine the date locale. This is not ideal, as we use en-US for the english translation. |
| ⬜ | `admin-panel/src/routes/customers/customer-detail/components/customer-order-section/customer-order-section.tsx` | 66 | {/*TODO: ENABLE WHEN DRAFT ORDERS ARE DONE*/} |
| ⬜ | `admin-panel/src/routes/invite/invite.tsx` | 40 | // TODO: Update to V2 format |
| ⬜ | `admin-panel/src/routes/locations/location-edit/components/edit-location-form/edit-location-form.tsx` | 27 | phone: zod.string().optional(), // TODO: Add validation |
| ⬜ | `admin-panel/src/routes/locations/location-list/constants.ts` | 1 | // TODO: change this when RQ is fixed (address is not joined when *address) |
| ⬜ | `admin-panel/src/routes/locations/location-service-zone-shipping-option-pricing/components/create-shipping-options-form/edit-shipping-options-pricing-form.tsx` | 171 | * TODO: If we try to update an existing region price the API throws an error. |
| ⬜ | `admin-panel/src/routes/orders/order-allocate-items/components/order-create-fulfillment-form/order-allocate-items-form.tsx` | 58 | // TODO - empty state UI |
| ⬜ | `admin-panel/src/routes/orders/order-allocate-items/components/order-create-fulfillment-form/order-allocate-items-form.tsx` | 98 | * TODO: we should have bulk endpoint for this so this is executed in a workflow and can be reverted |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/add-claim-outbound-items-table/add-claim-outbound-items-table.tsx` | 64 | // TODO: Check inventory here. Check if other validations needs to be made |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 108 | // TODO: implement confirm claim request |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 115 | // TODO: implement update claim request |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 538 | // TODO: fix this for inventory kits |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-create-form.tsx` | 565 | // TODO: add this on ESC press |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-item.tsx` | 19 | // TODO: create a payload type for outbound updates |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-item.tsx` | 70 | // TODO: add max available inventory quantity if present |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-section.tsx` | 64 | // TODO: filter in the API when boolean filter is supported and fulfillment module support partial rule SO filtering |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/claim-outbound-section.tsx` | 260 | // TODO: Ensure inventory validation occurs correctly |
| ⬜ | `admin-panel/src/routes/orders/order-create-claim/components/claim-create-form/schema.ts` | 14 | item_id: z.string(), // TODO: variant id? |
| ⬜ | `admin-panel/src/routes/orders/order-create-edit/components/add-order-edit-items-table/add-order-edit-items-table.tsx` | 57 | // TODO: Check inventory here. Check if other validations needs to be made |
| ⬜ | `admin-panel/src/routes/orders/order-create-exchange/components/add-exchange-outbound-items-table/add-exchange-outbound-items-table.tsx` | 64 | // TODO: Check inventory here. Check if other validations needs to be made |
| ⬜ | `admin-panel/src/routes/orders/order-create-exchange/components/exchange-create-form/exchange-outbound-item.tsx` | 19 | // TODO: create a payload type for outbound updates |
| ⬜ | `admin-panel/src/routes/orders/order-create-exchange/components/exchange-create-form/exchange-outbound-item.tsx` | 70 | // TODO: add max available inventory quantity if present |
| ⬜ | `admin-panel/src/routes/orders/order-create-exchange/components/exchange-create-form/exchange-outbound-section.tsx` | 63 | // TODO: filter in the API when boolean filter is supported and fulfillment module support partial rule SO filtering |
| ⬜ | `admin-panel/src/routes/orders/order-create-fulfillment/components/order-create-fulfillment-form/order-create-fulfillment-form.tsx` | 91 | // is_return: false, // TODO: 500 when enabled |
| ⬜ | `admin-panel/src/routes/orders/order-create-fulfillment/components/order-create-fulfillment-form/order-create-fulfillment-form.tsx` | 181 | } // else -> TODO: what if original shipping option is deleted? |
| ⬜ | `admin-panel/src/routes/orders/order-create-return/components/return-create-form/return-create-form.tsx` | 116 | * TODO: this should accept filter for location_id |
| ⬜ | `admin-panel/src/routes/orders/order-create-return/components/return-create-form/return-create-form.tsx` | 170 | * TODO: reason selection once Return reason settings are added |
| ⬜ | `admin-panel/src/routes/orders/order-create-return/components/return-create-form/schema.ts` | 15 | // TODO: implement this |
| ⬜ | `admin-panel/src/routes/orders/order-create-shipment/components/order-create-shipment-form/constants.ts` | 7 | // TODO: this 2 are not optional in the API |
| ⬜ | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-activity-section.tsx` | 19 | {/* TODO: Re-add when we have support for notes */} |
| ⬜ | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx` | 676 | * TODO: Add once notes are supported. |
| ⬜ | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx` | 794 | return acc + (isReceived ? item.received_quantity : item.quantity) // TODO: revisit when we add dismissed quantity on ReturnItem |
| ⬜ | `admin-panel/src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx` | 1030 | * TODO: change original_email to customer info when action details is changed |
| ⬜ | `admin-panel/src/routes/orders/order-detail/order-detail.tsx` | 41 | // TODO: Retrieve endpoints don't have an order ability, so a JS sort until this is available |
| ⬜ | `admin-panel/src/routes/orders/order-list/components/order-list-table/use-order-table-filters.tsx` | 57 | // TODO: Add payment and fulfillment status filters when they are properly linked to orders |
| ⬜ | `admin-panel/src/routes/orders/order-receive-return/components/order-receive-return-form/dismissed-quantity.tsx` | 63 | // TODO: if out of bounds prevent sending and notify user |
| ⬜ | `admin-panel/src/routes/orders/order-receive-return/order-receive-return.tsx` | 30 | }) // TODO: fix API needs to return 404 if return not exists and not an empty object |
| ⬜ | `admin-panel/src/routes/product-variants/product-variant-edit/components/product-edit-variant-form/product-edit-variant-form.tsx` | 44 | // TODO: Either pass option ID or make the backend handle options constraints differently to handle the lack of IDs |
| ⬜ | `admin-panel/src/routes/products/product-create-variant/components/create-product-variant-form/create-product-variant-form.tsx` | 128 | const isCurrentTabDirty = false // isTabDirty(tab) TODO |
| ⬜ | `admin-panel/src/routes/products/product-create/components/product-create-form/product-create-form.tsx` | 91 | * TODO: Important to revisit this - use variants watch so high in the tree can cause needless rerenders of the entire page |
| ⬜ | `admin-panel/src/routes/products/product-create/components/product-create-organize-form/product-create-organize-form.tsx` | 25 | {/* TODO: WHERE DO WE SET PRODUCT ATTRIBUTES? -> the plan is to moved that to Inventory UI */} |
| ⬜ | `admin-panel/src/routes/products/product-detail/components/product-sales-channel-section/product-sales-channel-section.tsx` | 12 | // TODO: The fetched sales channel doesn't contain all necessary info |
| ⬜ | `admin-panel/src/routes/profile/profile-detail/components/profile-general-section/profile-general-section.tsx` | 65 | {/* TODO: Do we want to implement usage insights in V2? */} |
| ⬜ | `admin-panel/src/routes/profile/profile-edit/components/edit-profile-form/edit-profile-form.tsx` | 148 | {/* TODO: Do we want to implement usage insights in V2? */} |
| ⬜ | `admin-panel/src/routes/profile/profile-edit/components/edit-profile-form/edit-profile-form.tsx` | 175 | // TODO change link once docs are public |
| ⬜ | `admin-panel/src/routes/reservations/reservation-detail/components/reservation-general-section/reservation-general-section.tsx` | 66 | value={reservation.line_item_id} // TODO fetch order instead + add link |
| ⬜ | `admin-panel/src/routes/tax-regions/tax-region-metadata/tax-region-metadata.tsx` | 8 | * TODO: Tax region update endpoint is missing |
| ⬜ | `admin-panel/src/routes/workflow-executions/workflow-execution-detail/components/workflow-execution-history-section/workflow-execution-history-section.tsx` | 203 | // TODO: Apply resolve value: packages/core/workflows-sdk/src/utils/composer/helpers/resolve-value.ts |
| ⬜ | `admin-panel/src/routes/workflow-executions/workflow-execution-detail/components/workflow-execution-history-section/workflow-execution-history-section.tsx` | 227 | // TODO: Apply resolve value: packages/core/workflows-sdk/src/utils/composer/helpers/resolve-value.ts |

## storefront (0)

- No open TODO/FIXME markers.

## vendor-panel (0)

- No open TODO/FIXME markers.

## Usage

- Check an item (`⬜` → `✅`) when completed.
- Remove the row once merged if you prefer a compact tracker.
- Re-generate by re-running: `rg -n "TODO|FIXME" admin-panel/src storefront/src vendor-panel/src`.
