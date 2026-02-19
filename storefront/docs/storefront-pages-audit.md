# Storefront Pages, Routes, and Links Audit

Date: 2026-02-19  
Scope: storefront route files in `storefront/src/app/[locale]/**/page.tsx` and internal storefront links in `storefront/src/**/*.tsx`.

## Audit method

1. Enumerated all page routes with:
   - `find storefront/src/app/'[locale]' -name 'page.tsx' | sort`
2. Ran storefront lint health check with:
   - `pnpm --dir storefront lint`
3. Ran static checks over route/page files to evaluate:
   - metadata coverage (`generateMetadata` or `metadata` export)
   - dynamic route fallback handling (`notFound` usage)
4. Ran a static internal-link audit over `.tsx` files to compare hard-coded internal hrefs against routed pages and identify unmatched links.

## Current route inventory

- Total page routes discovered: **47**.
- Route groups include:
  - Marketing/content pages (`/`, `/how-it-works`, `/sell`, `/invest`, etc.)
  - Commerce pages (`/collections`, `/products/[handle]`, `/cart`, `/checkout`)
  - Marketplace directories (`/vendors`, `/producers`, `/kitchens`, `/gardens`)
  - User/account flows (`/user/*`, `/forgot-password`, `/reset-password`)
  - Collective demand pools (`/collective/demand-pools/*`)

## Findings

### 1) Lint status is healthy

- `pnpm --dir storefront lint` passes with no ESLint errors.
- Non-blocking warning observed from Next.js about multiple lockfiles and inferred workspace root.

### 2) Metadata coverage remains incomplete

20/47 routes still do not define route metadata (`generateMetadata` or `metadata` export):

- `/collections/[handle]`
- `/collective/demand-pools/[id]`
- `/collective/demand-pools/new`
- `/sell`
- `/sellers/[handle]/reviews`
- `/user`
- `/user/orders`
- `/user/orders/[id]`
- `/user/orders/[id]/return`
- `/user/orders/[id]/request-success`
- `/user/wishlist`
- `/user/addresses`
- `/user/messages`
- `/user/settings`
- `/user/reviews`
- `/user/reviews/written`
- `/user/returns`
- `/user/register`
- `/forgot-password`
- `/reset-password`

### 3) Dynamic-route fallback handling is still inconsistent

10 dynamic page routes do not currently use explicit `notFound()` fallback handling:

- `/collections/[handle]`
- `/gardens/[handle]`
- `/kitchens/[handle]`
- `/producers/[handle]`
- `/products/[handle]`
- `/sellers/[handle]`
- `/sellers/[handle]/reviews`
- `/user/orders/[id]`
- `/user/orders/[id]/return`
- `/user/orders/[id]/request-success`

### 4) Internal link mismatch found and remediated

The static link audit identified one unmatched hard-coded internal route:

- `/returns` (no corresponding storefront page route)

This was present in the order-return UI copy and has been corrected to the existing routed page:

- Updated link target from `/returns` → `/user/returns`

## Recommended follow-up

1. Add metadata to high-traffic public routes first (`/sell`, `/collections/[handle]`, `/collective/demand-pools/[id]`, `/sellers/[handle]/reviews`).
2. Standardize dynamic route not-found handling to improve consistent UX/status behavior.
3. Continue periodic static link audits to catch route drift as new pages are added.
