# Phase 0 Foundations Pack

This document captures the Phase 0 execution artifacts referenced by `FEATURE_BUILD_PLAN.md`.

## Included Deliverables

### 1) Domain model alignment contracts

Canonical contracts and JSON schemas are defined in:

- `docs/contracts/phase0/domain-contracts.schema.json`

Contracts included:

- `SalesChannel`
- `InventoryLedgerEvent`
- `OrderSyncEvent`
- `WeightPriceRule`
- `PickPackBatch`
- `Invoice`
- `MerchantCase`
- `RiskAlert`
- `OnboardingProgram`
- `TrainingAsset`
- `PromoCampaign`

### 2) Architecture decisions (ADRs)

- `docs/adr/ADR-0001-event-driven-sync.md`
- `docs/adr/ADR-0002-idempotency-and-consistency-windows.md`

### 3) Feature flags

Phase 0 flag registry:

- `backend/src/shared/feature-flags.ts`

Environment variables follow `FF_*` naming and default to disabled.

### 4) Queue + DLQ policies

Critical topic contracts and dead-letter settings:

- `backend/src/shared/queue-topics.ts`

Covered critical flows:

- Payments settlement
- Inventory sync
- Invoice issuance

### 5) Observability baseline and SLO targets

Baseline telemetry requirements:

- Structured logs include: `trace_id`, `span_id`, `event_name`, `module`, `entity_id`, `idempotency_key`.
- Distributed traces enabled where `OTEL_ENABLED=true`.
- Queue metrics: lag, retries, DLQ growth, oldest message age.

Initial SLO targets:

- Inventory sync projection freshness: p95 <= 60s
- Order sync projection freshness: p95 <= 120s
- Invoice issuance latency: p95 <= 300s
- Critical queue DLQ rate: < 1% daily per topic

## Exit Criteria Mapping

From the Phase 0 plan:

- **Approved architecture docs** → ADRs added under `docs/adr`.
- **Data contracts and JSON schemas committed** → Schema file under `docs/contracts/phase0`.
- **Feature flags wired in backend and UIs** → Backend registry added; UI wiring is the next execution step.

## Next Execution Step

Wire these backend contracts/flags into module implementations for POS, weight-pricing, pick/pack, invoicing, and channel sync in Phase 1 workstreams.
