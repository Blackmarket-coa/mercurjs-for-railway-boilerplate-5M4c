# Vendor Panel Audit Report

**Date:** 2026-02-02
**Scope:** `/vendor-panel/src/` directory
**Summary:** This audit covers the vendor panel application, focusing on security, routing, API patterns, type safety, and code quality.

---

## Executive Summary

The vendor panel is a well-structured React application built on the Medusa framework with support for multiple vendor types (producer, garden, kitchen, maker, restaurant, mutual_aid). However, several issues were identified that should be addressed:

| Category | Severity | Issues Found |
|----------|----------|--------------|
| Missing Routes | High | 4 navigation links point to non-existent routes |
| Incomplete Features | Medium | 30+ TODO comments indicating unfinished work |
| Type Safety | Medium | 99 uses of `any` type in API hooks |
| Console Statements | Low | 36 console.log/error/warn in production code |
| Internationalization | Low | Some error messages hardcoded in Polish |

---

## Critical Issues

### 1. Missing Routes (High Severity)

The navigation configuration in `src/hooks/navigation/use-vendor-navigation.tsx` references routes that do not exist in `src/providers/router-provider/route-map.tsx`:

| Navigation Link | Status | Impact |
|-----------------|--------|--------|
| `/menu` | Missing | Restaurants get 404 |
| `/menu/items` | Missing | Restaurants get 404 |
| `/menu/categories` | Missing | Restaurants get 404 |
| `/plots` | Missing | Gardens get 404 |
| `/plots/available` | Missing | Gardens get 404 |
| `/plots/assignments` | Missing | Gardens get 404 |
| `/volunteers` | Missing | Gardens/Mutual Aid get 404 |
| `/volunteers/list` | Missing | Gardens/Mutual Aid get 404 |
| `/volunteers/schedule` | Missing | Gardens/Mutual Aid get 404 |
| `/donations` | Missing | Gardens/Mutual Aid/Kitchens get 404 |

**Location:** `vendor-panel/src/hooks/navigation/use-vendor-navigation.tsx:112-168`

**Recommendation:** Either create these route components or remove the navigation items until the features are implemented.

---

### 2. Incomplete Route Implementations (High Severity)

#### a) Delivery Detail Page Missing
- **Location:** `route-map.tsx:1054-1067`
- **Issue:** `/deliveries/:id` uses `DeliveryList` component instead of a detail view
- **Comment:** `// TODO: Create delivery detail page`

#### b) Delivery Zone Edit Uses Create Component
- **Location:** `route-map.tsx:1097-1109`
- **Issue:** `/delivery-zones/:id/edit` reuses `DeliveryZoneCreate` component
- **Comment:** `// TODO: Create zone edit component`

---

## Medium Severity Issues

### 3. Type Safety Issues

**99 instances of `: any` type found across API hooks**

Most affected files:
- `hooks/api/returns.tsx` - 20 occurrences
- `hooks/api/claims.tsx` - 19 occurrences
- `hooks/api/exchanges.tsx` - 16 occurrences
- `hooks/api/products.tsx` - 11 occurrences
- `hooks/api/orders.tsx` - 9 occurrences

**Example from `hooks/api/products.tsx:36-39`:**
```typescript
export const useCreateProductOption = (
  productId: string,
  options?: UseMutationOptions<any, FetchError, any>  // Should be typed
)
```

**Recommendation:** Replace `any` types with proper TypeScript interfaces for better type safety and developer experience.

---

### 4. Incomplete Features (30+ TODOs)

Key incomplete features identified:

| Feature | Location | Description |
|---------|----------|-------------|
| 404 Page | `routes/no-match/no-match.tsx:6` | "TODO: Add 404 page" |
| Onboarding API checks | `routes/dashboard/components/dashboard-onboarding.tsx:97-99` | menu, plots, volunteers flags not from API |
| Batch variant updates | `hooks/api/products.tsx:227` | Individual calls instead of batch endpoint |
| Payment activity section | `routes/orders/order-detail/order-detail.tsx:75` | Payment dates not displayed |
| Order sorting | `routes/orders/order-detail/order-detail.tsx:31` | JS sort instead of API-level ordering |
| Secret API Keys | `components/layout/settings-layout/settings-layout.tsx:104-108` | Feature commented out |
| Invite flow | `routes/invite/invite.tsx:35` | "TODO: Update to V2 format" |

---

### 5. Inconsistent API Patterns

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

### 6. Console Statements in Production Code

**36 console statements found** that should be removed or replaced with proper logging:

Key locations:
- `lib/client/client.ts:49` - `console.warn` on token decode failure
- `hooks/api/auth.tsx:140` - `console.error` on registration failure
- `routes/messages/messages.tsx` - 4 console statements
- `components/layout/admin-chat/AdminChat.tsx` - 3 console statements

**Recommendation:** Implement a proper logging solution or remove debug statements.

---

### 7. Hardcoded Polish Text

Error messages in `lib/client/client.ts:136` are in Polish:

```typescript
throw new Error("Brak autoryzacji. Zaloguj się ponownie.")
// Should be: throw new Error("Unauthorized. Please log in again.")
```

**Recommendation:** Use i18n translation keys for all user-facing strings.

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
1. Remove or implement missing navigation routes (`/menu`, `/plots`, `/volunteers`, `/donations`)
2. Create delivery detail page component
3. Create proper edit component for delivery zones

### Short-term Actions (Medium Priority)
1. Replace `any` types with proper TypeScript interfaces
2. Implement 404 page design
3. Standardize API call patterns (fetchQuery vs SDK)

### Long-term Actions (Low Priority)
1. Remove console statements or implement logging
2. Translate hardcoded Polish strings
3. Add session timeout functionality
4. Increase test coverage

---

## Files Reviewed

- `src/providers/router-provider/route-map.tsx` - Route configuration
- `src/hooks/navigation/use-vendor-navigation.tsx` - Navigation config
- `src/components/authentication/protected-route/protected-route.tsx` - Auth flow
- `src/lib/client/client.ts` - API client
- `src/hooks/api/*.tsx` - API hooks (auth, users, products, orders)
- `src/providers/vendor-type-provider/vendor-type-context.tsx` - Vendor types
- `src/components/utilities/error-boundary/error-boundary.tsx` - Error handling
- `src/types/user.ts` - User type definitions

---

*Report generated as part of vendor panel audit - February 2026*
