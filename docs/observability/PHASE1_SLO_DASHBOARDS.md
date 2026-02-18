# Phase 1 Observability Dashboards + SLO Alerts

This runbook operationalizes Phase 0 thresholds into executable dashboards and alert rules for Phase 1 (POS + core commerce operations).

## Dashboards

Create these dashboards in your metrics backend (Grafana/Datadog/New Relic):

1. **Queue Health · Inventory Sync**
   - Metrics: queue lag, oldest message age, retry count, DLQ growth
   - Topic: `inventory.sync.v1`
   - DLQ: `inventory.sync.dlq.v1`
2. **Queue Health · Invoice Issuance**
   - Metrics: queue lag, oldest message age, retry count, DLQ growth
   - Topic: `invoice.issuance.v1`
   - DLQ: `invoice.issuance.dlq.v1`
3. **Projection Freshness**
   - Inventory projection freshness p95
   - Order sync projection freshness p95
4. **Workflow Latency**
   - Invoice issuance latency p95
   - POS/order mutation round-trip latency p95

## SLOs and Alert Thresholds

| SLI | Target | Alert |
|---|---:|---:|
| Inventory sync projection freshness p95 | `<= 60s` | warn at `> 45s` for 10m, critical at `> 60s` for 10m |
| Order sync projection freshness p95 | `<= 120s` | warn at `> 90s` for 10m, critical at `> 120s` for 10m |
| Invoice issuance latency p95 | `<= 300s` | warn at `> 240s` for 10m, critical at `> 300s` for 10m |
| Critical topic DLQ rate daily | `< 1%` | warn at `>= 0.5%`, critical at `>= 1%` |
| Critical queue lag | bounded by freshness windows | warn when trend slope is positive for 15m |

## Alert Payload Requirements

All alerts should include:

- `trace_id`
- `span_id`
- `event_name`
- `module`
- `entity_id`
- `idempotency_key`
- `topic`
- `dead_letter_topic`
- `retry.attempt` and `retry.maxRetries`

## Phase 1 Guardrails

- Keep POS + core commerce operations behind runtime gates until DLQ rate stays `< 1%` for 7 consecutive days.
- Block expansion of traffic cohorts if either inventory freshness or invoice latency SLO is breached.
- Run replay drills weekly for DLQ messages to verify idempotent recovery.
