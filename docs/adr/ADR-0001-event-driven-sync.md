# ADR-0001: Event-driven Sync Contract for Multi-Channel Commerce

- **Status:** Accepted
- **Date:** 2026-02-18
- **Owners:** Platform / Backend
- **Phase:** Phase 0 Foundations

## Context

The platform must synchronize inventory and order state across storefront, POS, social, and marketplace channels. Direct point-to-point updates create coupling and race conditions.

## Decision

Adopt an event-driven synchronization contract with canonical domain events:

- `InventoryLedgerEvent`
- `OrderSyncEvent`

Events are published to versioned queue topics and consumed by channel-specific processors.

## Consequences

### Positive

- Loose coupling between channel adapters and core order/inventory logic.
- Replayability for recovery and reconciliation.
- Clear auditability for synchronization decisions.

### Tradeoffs

- Eventual consistency windows must be documented and monitored.
- Consumers must be idempotent and tolerant of duplicate delivery.

## Implementation Notes

- Queue topics + DLQ policies are documented in `backend/src/shared/queue-topics.ts`.
- JSON schemas for event payloads are defined in `docs/contracts/phase0/domain-contracts.schema.json`.
