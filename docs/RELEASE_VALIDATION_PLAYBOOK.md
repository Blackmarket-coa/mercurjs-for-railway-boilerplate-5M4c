# Phase 2 Release Validation Playbook

This playbook operationalizes the completion tracker's Phase 2 requirements into a repeatable command flow.

## 1) Run backend and storefront validation first

```bash
./scripts/release_validation.sh
```

What this runs by default:
- Backend: `test:unit`, `test:integration:http`, `test:integration:modules`
- Storefront: `pnpm test` when available, otherwise falls back to `pnpm run lint`

## 2) Run Hawala-first smoke checks (highest-risk financial flows)

Set environment variables and rerun the script:

```bash
export BACKEND_URL="https://your-backend.example.com"
export STORE_TOKEN="..."
export VENDOR_TOKEN="..."
export ADMIN_TOKEN="..."

./scripts/release_validation.sh
```

Included Hawala checks:
- Store wallet + transactions (valid token)
- Store deposit invalid-token failure-path
- Vendor dashboard (valid token)
- Admin summary (valid token + invalid-token failure-path)

## 3) Expand to integration contract/failure-path checks

Provide endpoints as a comma-separated list:

```bash
export INTEGRATION_ENDPOINTS="/admin/printful/health,/admin/woocommerce-import/status"
./scripts/release_validation.sh
```

For each integration endpoint:
- Contract check accepts `2xx` or expected client-side `4xx` (never `5xx`)
- Failure-path check with invalid token expects `401` or `403`

## 4) Gate release on 4-part exit criteria

A release is *eligible* only if all four are satisfied:
1. **Structure pass**: modules/workflows/routes exist.
2. **Test pass**: backend/storefront validation is green.
3. **Health pass**: smoke checks return expected auth + payload behavior.
4. **Regression pass**: no unresolved critical/high issues in release window.

## Suggested CI usage

```bash
BACKEND_URL="$BACKEND_URL" \
STORE_TOKEN="$STORE_TOKEN" \
VENDOR_TOKEN="$VENDOR_TOKEN" \
ADMIN_TOKEN="$ADMIN_TOKEN" \
INTEGRATION_ENDPOINTS="$INTEGRATION_ENDPOINTS" \
./scripts/release_validation.sh
```
