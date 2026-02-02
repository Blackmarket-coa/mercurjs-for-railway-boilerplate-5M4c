# Vendor Panel Audit Report

**Date:** 2026-02-02 (updated)
**Scope:** `/vendor-panel/src/` directory
**Summary:** This audit covers the vendor panel application, focusing on security, routing, API patterns, type safety, and code quality.

---

## Executive Summary

The vendor panel remains a well-structured React application built on the Medusa framework with support for multiple vendor types (producer, garden, kitchen, maker, restaurant, mutual_aid). This update verifies that several previously reported gaps have been addressed (missing routes and delivery detail/edit placeholders), while a smaller set of quality issues remains.

| Category | Severity | Issues Found |
|----------|----------|--------------|
| Missing Routes | ✅ Resolved | Navigation routes for menu, plots, volunteers, donations now exist |
| Incomplete Features | Medium | 28 TODO/FIXME comments indicating unfinished work |
| Type Safety | Medium | 73 uses of `any` type in API hooks |
| Console Statements | Low | 27 console.log/error/warn in production code |
| Internationalization | Low | No hardcoded Polish error messages found in runtime code |

---

## Critical Issues

No high-severity issues identified in this update. Previously missing routes and placeholder route components have been implemented.

---

## Medium Severity Issues

### 1. Type Safety Issues

**73 instances of `any` type found across API hooks**

Most affected files:
- `hooks/api/requests.tsx`
- `hooks/api/inventory.tsx`
- `hooks/api/customers.tsx`
- `hooks/api/price-lists.tsx`
- `hooks/api/fulfillment.tsx`

**Recommendation:** Replace `any` types with proper TypeScript interfaces for better type safety and developer experience.

---

### 2. Incomplete Features (28 TODO/FIXME)

Key incomplete features identified:

| Feature | Location | Description |
|---------|----------|-------------|
| Fulfillment/order linkage | `components/table/table-cells/order/fulfillment-status-cell/fulfillment-status-cell.tsx:18` | Awaiting fulfillment<>order link |
| Order sorting | `routes/orders/order-detail/order-detail.tsx:32` | JS sort until API ordering is available |
| Inventory location levels | `hooks/api/inventory.tsx:318` | API needs endpoint for location levels |
| Shipping option pricing | `routes/locations/location-service-zone-shipping-option-pricing/components/create-shipping-options-form/edit-shipping-options-pricing-form.tsx:162` | Update existing region price errors |
| Order fulfillment bulk | `routes/orders/order-allocate-items/components/order-create-fulfillment-form/order-allocate-items-form.tsx:93` | Needs bulk endpoint |

---

### 3. Inconsistent API Patterns

The codebase uses two different patterns for API calls:

**Pattern 1: Custom fetchQuery wrapper**
```typescript
// Used in most vendor-specific endpoints
fetchQuery(`/vendor/products/${id}`, { method: "GET" })
```

**Pattern 2: Medusa SDK**
```typescript
// Used for some operations
sdk.admin.product.listVariants(productId, query)
```

**Affected files:**
- `hooks/api/orders.tsx` - Mixes both patterns
- `hooks/api/products.tsx` - Mixes both patterns
- `hooks/api/promotions.tsx` - Uses SDK

**Recommendation:** Standardize on one pattern for consistency and maintainability.

---

## Low Severity Issues

### 4. Console Statements in Production Code

**27 console statements found** that should be removed or replaced with proper logging:

Key locations:
- `components/layout/pages/single-column-page/single-column-page.tsx` - `console.warn` for missing metadata
- `components/layout/admin-chat/AdminChat.tsx` - debug logs around RocketChat auth
- `routes/messages/messages.tsx` - RocketChat debug logs
- `lib/query-client.ts` - query/mutation error logs

**Recommendation:** Implement a proper logging solution or remove debug statements.

---

### 5. Internationalization

No hardcoded Polish error messages were found in runtime client code. Polish translations remain in `i18n` translation files, which is expected.

---

## Security Audit

### Authentication & Authorization (Passed)

- JWT tokens properly stored in localStorage
- Token cleared on 401/403 responses
- Registration status checked before accessing protected routes
- Actor type validated to prevent cross-tenant access

**Relevant code:** `src/components/authentication/protected-route/protected-route.tsx`

### Potential Improvements

1. **Session timeout** - No automatic session timeout implemented
2. **Token refresh** - No refresh token mechanism visible
3. **Rate limiting UI** - Error handling for 429 responses exists but could be improved

---

## Architecture Observations

### Strengths

1. **Vendor Type System** - Well-designed feature flag system based on vendor types
2. **Query Caching** - Proper use of React Query with cache invalidation
3. **Error Boundaries** - ErrorBoundary components on all routes
4. **Lazy Loading** - Routes use dynamic imports for code splitting
5. **i18n Support** - Translation infrastructure in place

### Areas for Improvement

1. **Route/Navigation Sync** - Navigation config should be derived from route config
2. **Type Safety** - Replace `any` types with proper interfaces
3. **Feature Flags** - Consider runtime feature flags instead of code-based ones
4. **Testing** - Limited test coverage visible

---

## Recommendations Summary

### Immediate Actions (High Priority)
1. No high-priority blockers identified in this update.

### Short-term Actions (Medium Priority)
1. Replace `any` types with proper TypeScript interfaces
2. Standardize API call patterns (fetchQuery vs SDK)

### Long-term Actions (Low Priority)
1. Remove console statements or implement logging
2. Add session timeout functionality
3. Increase test coverage

---

## Files Reviewed

- `src/providers/router-provider/route-map.tsx` - Route configuration
- `src/hooks/navigation/use-vendor-navigation.tsx` - Navigation config
- `src/hooks/api/*.tsx` - API hooks (requests, inventory, customers, fulfillment)
- `src/components/layout/pages/single-column-page/single-column-page.tsx` - Metadata warnings
- `src/routes/messages/messages.tsx` - RocketChat logs
- `src/lib/query-client.ts` - Query/mutation error logging

---

*Report generated as part of vendor panel audit - February 2026*
