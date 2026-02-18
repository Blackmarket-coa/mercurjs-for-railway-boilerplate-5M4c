# ADR-0002: Idempotency Strategy and Eventual Consistency Windows

- **Status:** Accepted
- **Date:** 2026-02-18
- **Owners:** Platform / Backend
- **Phase:** Phase 0 Foundations

## Context

Order and financial workflows involve retries, webhooks, and async processing. Duplicate execution can produce over-charges, over-refunds, and inventory drift.

## Decision

1. Require idempotency keys for all mutating external-facing payment/sync actions.
2. Store idempotency keys with operation scope + request fingerprint.
3. Define bounded eventual-consistency windows by workflow:
   - Inventory sync projection: target <= 60s
   - Order sync projection: target <= 120s
   - Invoicing propagation: target <= 300s
4. Route poison/repeated failures to DLQ topics with retry metadata.

## Consequences

### Positive

- Safer retries for API clients and subscribers.
- Deterministic replay behavior for failed jobs.
- Consistency expectations are explicit and measurable.

### Tradeoffs

- Additional storage and lookup overhead for idempotency records.
- Requires strict monitoring of lag and DLQ growth.

## Implementation Notes

- Topic + retry metadata contracts are in `backend/src/shared/queue-topics.ts`.
- Observability/SLO baseline is documented in `docs/PHASE_0_FOUNDATIONS.md`.
