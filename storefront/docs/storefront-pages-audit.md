# Storefront Pages Audit

Date: 2026-02-09  
Scope: `storefront/src/app/[locale]/**/page.tsx` (42 routed pages)

## Audit method

1. Enumerated all storefront page routes from the Next.js app router.
2. Ran linting for the storefront (`pnpm --dir storefront lint`) and isolated page-level issues.
3. Performed static route checks for:
   - metadata coverage (`generateMetadata` or `export const metadata`)
   - dynamic-route fallback handling (`notFound` usage)
   - auth-gated account pages

## Findings

### 1) Lint failures in storefront page files (blocking)

The current storefront lint run fails on page-level issues that should be fixed before release:

- `src/app/[locale]/(main)/how-it-works/page.tsx`
  - multiple `react/no-unescaped-entities` errors
- `src/app/[locale]/(main)/invest/page.tsx`
  - repeated `@next/next/no-html-link-for-pages` for `/wallet/` (raw `<a>` used instead of `next/link`)
- `src/app/[locale]/(main)/sell/page.tsx`
  - multiple `react/no-unescaped-entities` errors
- `src/app/[locale]/(main)/vendor-types/page.tsx`
  - multiple `react/no-unescaped-entities` errors

### 2) Metadata coverage is incomplete

20/42 pages do not define route metadata (`generateMetadata` or `metadata` export). This mainly affects account and utility routes, plus several public routes:

- Public/marketing routes missing metadata:
  - `/collections/[handle]`
  - `/collective/demand-pools/[id]`
  - `/collective/demand-pools/new`
  - `/sell`
  - `/sellers/[handle]/reviews`
- User/account routes missing metadata:
  - `/user`, `/user/orders`, `/user/orders/[id]`, `/user/orders/[id]/return`, `/user/orders/[id]/request-success`
  - `/user/wishlist`, `/user/addresses`, `/user/messages`, `/user/settings`
  - `/user/reviews`, `/user/reviews/written`, `/user/returns`, `/user/register`
- Password routes missing metadata:
  - `/forgot-password`, `/reset-password`

### 3) Dynamic-route fallback handling is inconsistent

Only one dynamic page currently uses explicit `notFound()` handling (`/categories/[category]`). The following dynamic routes have no explicit not-found fallback in the page file:

- `/collections/[handle]`
- `/collective/demand-pools/[id]`
- `/gardens/[handle]`
- `/kitchens/[handle]`
- `/producers/[handle]`
- `/products/[handle]`
- `/sellers/[handle]`
- `/user/orders/[id]`

This can lead to inconsistent UX and status-code behavior if downstream loaders return empty data.

## Recommended remediation order

1. **Fix lint blockers in page files** so CI can pass (`how-it-works`, `invest`, `sell`, `vendor-types`).
2. **Add metadata exports** to public pages first (`sell`, `collections/[handle]`, `demand-pools/[id]`, `sellers/[handle]/reviews`).
3. **Standardize dynamic route fallback** (`notFound()` on missing resources).
4. Add metadata to account and password pages for consistency and cleaner SERP/social previews when shared.

## Notes

- This audit focused on route-level implementation quality, SEO coverage, and lint health for all storefront pages.
- Non-page component issues also exist in the lint output, but were not expanded here because the request was page-focused.
