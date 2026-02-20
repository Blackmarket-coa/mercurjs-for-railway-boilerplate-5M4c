# Vendor portal audit (links and pages)

## Scope
- Application: `vendor-panel`
- Route and page source of truth: `vendor-panel/src/providers/router-provider/route-map.tsx`
- Internal navigation references: `vendor-panel/src/**/*.ts(x)`
- External links reviewed: `vendor-panel/README.md`

## Checks run
1. Route import integrity
   - Parsed lazy route imports from `route-map.tsx`
   - Verified each imported module path resolves to an existing route file (`index.tsx`, `page.tsx`, `.tsx`, `.ts`)
2. Route footprint inventory
   - Counted route `path:` entries and unique path strings in `route-map.tsx`
3. Internal link target inventory
   - Collected static link targets from:
     - `Link to="/..."`
     - `navigate("/...")`
     - object literals with `to: "/..."`
4. External README link health
   - Sent `curl -L -I` requests for all `http(s)` URLs in `vendor-panel/README.md`

## Results

### 1) Pages / route modules
- Lazy route imports found: **220** total (**194 unique**)
- Missing route modules: **0**
- Result: all referenced lazy route modules in `route-map.tsx` currently resolve.

### 2) Route map coverage
- `path:` entries found in `route-map.tsx`: **225**
- Unique path strings: **128**
- Result: vendor portal has broad page coverage across commerce, settings, requests, farm, delivery/menu, and messaging flows.

### 3) Internal links
- Static internal link targets discovered: **69** unique routes
- Sample includes:
  - `/dashboard`
  - `/orders`
  - `/products/create`
  - `/settings/store`
  - `/settings/profile`
  - `/finances`
- Result: no obvious broken static internal route references were detected from this static audit.

### 4) External links (README)
- URLs checked in `vendor-panel/README.md`: **17**
- Reachable (HTTP 200): **15**
- Not reachable from CI environment: **2** (`http://localhost:3000`, `http://localhost:9000`)
- Interpretation: unreachable links are expected local development URLs, not production URLs.

## Findings summary
- ✅ **No missing vendor page modules** referenced by lazy-loaded route definitions.
- ✅ **Internal navigation coverage is substantial** and appears consistent for static paths.
- ⚠️ **README contains localhost links** that fail in non-local environments; this is expected for setup docs.

## Recommended follow-ups
1. Add a small CI script to continuously validate:
   - lazy route import resolution
   - internal static link target extraction
2. Optionally annotate localhost links in `vendor-panel/README.md` as “local-only” to reduce false alarms in link checkers.
3. Add a browser-level smoke test (Playwright/Cypress) for high-traffic vendor pages:
   - `/dashboard`
   - `/products`
   - `/orders`
   - `/settings/store`

