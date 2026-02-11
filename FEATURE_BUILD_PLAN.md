# Feature Build Plan: Farm Commerce Service Gaps

This plan covers the missing capabilities identified in repository review and proposes an implementation sequence across backend (`Medusa` modules/APIs), vendor/admin panels, storefront, and operations tooling.

## Goals

1. Close commerce-operational gaps (POS, weight pricing, pick/pack, invoicing, sync).
2. Add service-layer capabilities (merchant support, managed onboarding, training/resources).
3. Add trust and risk controls (fraud monitoring).
4. Turn ad-hoc marketing/support content into productized programs.

## Delivery Principles

- **Module-first backend design**: each major domain gets a dedicated module with workflows, events, and APIs.
- **Operational visibility**: every feature ships with dashboard views, audit logs, and metrics.
- **Phased rollout**: start with MVP + feature flags, then automate.
- **Multi-channel by default**: storefront, mobile web/PWA, social integrations, and POS sync on a shared product/order/inventory event model.

---

## Phase 0 (2 weeks): Foundations & Architecture

### 0.1 Domain model alignment
- Define canonical entities and events:
  - `SalesChannel` (storefront, POS, social, marketplace feed)
  - `InventoryLedgerEvent` and `OrderSyncEvent`
  - `WeightPriceRule`
  - `PickPackBatch`
  - `Invoice`
  - `MerchantCase` and `RiskAlert`
  - `OnboardingProgram`, `TrainingAsset`, `PromoCampaign`
- Add ADR docs for event-driven sync, idempotency, and eventual consistency windows.

### 0.2 Platform prerequisites
- Add feature flags for each capability.
- Add queue topics and dead-letter policies for critical flows (payments, inventory sync, invoice issuance).
- Add observability baseline: traces, structured logs, and SLO dashboards.

**Exit criteria**
- Approved architecture docs.
- Data contracts and JSON schemas committed.
- Feature flags wired in backend and UIs.

---

## Phase 1 (4–6 weeks): Core Commerce Operations

## 1) POS for in-person market/pickup sales

### Scope
- Vendor-facing POS app mode (tablet-friendly in vendor panel).
- Offline-tolerant cart capture and queued sync.
- Cash/card split tenders, receipt generation, pickup tags.

### Backend
- New `pos` module:
  - `pos_session`, `pos_device`, `pos_transaction`, `cash_drawer_count` models.
  - APIs: open/close session, ring sale, void/refund, end-of-day report.
- Integrate with existing order pipeline as `sales_channel = POS`.

### Frontend
- Vendor panel POS route (`/pos`) with quick product search, weighted item entry, discount buttons.
- Printable receipt template + QR order lookup.

### Ops
- Device setup guide and market-day checklist.

**MVP acceptance**
- Complete sale in < 20 seconds median.
- End-of-day reconciliation report generated.

## 2) Sell-by-weight pricing

### Scope
- Price-per-unit-weight products (lb/kg), tare support, min increment rules.
- Optional estimated-at-checkout, final-at-fulfillment adjustment flow.

### Backend
- Extend product/pricing schema:
  - `pricing_mode = fixed | weight`
  - `weight_unit`, `price_per_unit`, `min_weight`, `step_weight`, `average_weight`.
- Add workflow for capture/finalization delta charge or adjustment.

### Frontend
- Vendor product editor for weight rules.
- Storefront UI for “estimated total” and post-fulfillment final total.
- POS support for direct scale/weight input.

**MVP acceptance**
- Weight product can be listed, sold, fulfilled, and invoiced correctly.

## 3) Real-time inventory/order sync across channels

### Scope
- Explicit event-driven sync and channel state visibility.

### Backend
- `channel-sync` module:
  - Event bus consumers for order placement/cancellation/return and inventory adjustments.
  - Conflict resolution strategy (last-write with vector/version + retry queue).
  - Channel health state and lag metrics.

### Frontend
- Vendor/admin sync dashboard with lag, errors, and replay controls.
- Product-level “channel sync status” indicator.

### Documentation
- Add clear “real-time sync” language + guarantees (e.g., < 5s target, fallback < 60s).

**MVP acceptance**
- Inventory update reflected across enabled channels within SLA.
- Retry + dead-letter replay workflow available.

---

## Phase 2 (3–5 weeks): Fulfillment & Financial Operations

## 4) Pick-and-pack lists (explicit feature)

### Scope
- Batch generation by delivery date/zone/order cycle.
- Pick list, pack slip, substitution and short-pick handling.

### Backend
- New `fulfillment-ops` module:
  - `pick_pack_batch`, `pick_item`, `pack_confirmation`, `substitution_log`.
  - APIs for create/assign/complete batches.

### Frontend
- Vendor tablet-optimized pick workflow (barcode optional).
- Print/export CSV/PDF for labels and slips.

**MVP acceptance**
- Batch can be generated, picked, packed, and completion updates order state.

## 5) Invoicing (full feature)

### Scope
- Draft/final invoices, tax breakdown, payment terms, partial payments, credits.

### Backend
- `invoicing` module:
  - `invoice`, `invoice_line`, `credit_note`, `payment_application`.
  - Number sequencing, PDF rendering, email dispatch.
  - Hooks to Hawala/Stripe records.

### Frontend
- Vendor: create/send invoice, mark paid, issue credit.
- Admin: invoice oversight and aging report.
- Customer: invoice history and downloads.

**MVP acceptance**
- Invoice lifecycle end-to-end with email + PDF + payment reconciliation.

## 6) Merchant support as a dedicated capability

### Scope
- Support case management + SLAs + escalation.

### Backend
- `merchant-support` module:
  - `merchant_case`, `case_note`, `case_tag`, `sla_timer`, `case_event`.
- Integrate with Rocket.Chat/email for threaded communication.

### Frontend
- Vendor “Support” center (open case, attach files, track status).
- Admin support console with queues and assignment.

**MVP acceptance**
- Case intake to resolution flow with SLA breach alerts.

## 7) Fraud monitoring (explicit capability)

### Scope
- Rules engine + risk scoring + review queue.

### Backend
- `risk` module:
  - Real-time checks on order/payment/account events.
  - Rules: velocity, mismatched geo, unusual amount, repeated payment failure.
  - `risk_alert` and decision outcomes.

### Frontend
- Admin risk dashboard with approve/hold/reject actions.
- Explainability panel per alert.

**MVP acceptance**
- Risk alerts generated in real-time and tied to operational actions.

---

## Phase 3 (4–6 weeks): Service Programs & Enablement

## 8) Managed onboarding team workflow

### Scope
- Convert basic wizard into managed success program.

### Backend
- `onboarding-success` module:
  - `onboarding_cohort`, `onboarding_task`, `owner_assignment`, `milestone`.
  - Auto-task templates by seller type.

### Frontend
- Vendor: progress tracker, scheduled calls, required docs checklist.
- Admin: onboarding manager board, workload balancing.

**MVP acceptance**
- Every new merchant gets assigned onboarding plan + owner + milestone tracking.

## 9) Marketing guidance / social best-practice program

### Scope
- Embedded playbooks and performance nudges.

### Backend
- `marketing-guidance` module:
  - `playbook`, `checklist`, `campaign_recommendation`, `content_template`.

### Frontend
- Vendor Marketing Hub with channel-specific checklists (Instagram/Facebook/TikTok/email).
- KPI cards: post cadence, CTR proxy, conversion uplift.

**MVP acceptance**
- Vendor can follow guided checklist and launch first campaign.

## 10) Academy training/workshops program

### Scope
- Learning center with courses, workshops, certifications.

### Backend
- `academy` module:
  - `course`, `lesson`, `workshop_event`, `attendance`, `certificate`.
- Webinar provider integration (Zoom/Jitsi) and recording links.

### Frontend
- Vendor learning portal + workshop calendar + progress tracking.

**MVP acceptance**
- Publish course, run workshop, issue completion certificate.

## 11) Custom farm website build included (service productization)

### Scope
- Productized professional services workflow.

### Backend
- `website-services` module:
  - `website_package`, `brief_form`, `milestone`, `handoff`.
- Intake-to-delivery pipeline with approvals.

### Frontend
- Vendor onboarding add-on selection + project status page.
- Admin project operations board.

**MVP acceptance**
- Website build request can be scoped, tracked, and delivered.

## 12) Promotional tools suite

### Scope
- Coupons, bundles, referral codes, seasonal campaigns, abandoned cart nudges.

### Backend
- Extend promotions domain with campaign orchestration and audience segments.
- Attribution fields for campaign performance.

### Frontend
- Vendor campaign builder (templates + scheduling).
- Analytics dashboard for promo performance.

**MVP acceptance**
- Merchant can launch and measure a promo campaign end-to-end.

## 13) E-books/webinars support resources

### Scope
- Resource library with gated downloads and webinar events.

### Backend
- `resources` module:
  - `resource_asset`, `resource_category`, `download_event`, `webinar_event`, `registration`.

### Frontend
- Public resource center + merchant-only downloadable library.
- Registration and reminder flow for webinars.

**MVP acceptance**
- Upload e-book, host webinar registration, capture engagement analytics.

---

## Cross-Cutting Requirements

### Security & Compliance
- Role-based access controls for financial/support/risk actions.
- Immutable audit logs for invoice and risk decisions.
- PII minimization in support and analytics exports.

### Data & Analytics
- Event taxonomy for all new modules.
- Warehouse-ready data model for cohort and revenue analysis.
- Standard dashboards: activation, retention, order quality, fraud losses, support SLA.

### Documentation
- Update product docs and README feature matrix with explicit capability language.
- Add runbooks for support, fulfillment, and risk ops.

---

## Suggested Release Sequencing

## Release A (Weeks 1–6)
- POS MVP
- Weight pricing MVP
- Channel sync MVP

## Release B (Weeks 7–11)
- Pick-and-pack MVP
- Invoicing MVP
- Merchant support MVP
- Fraud monitoring MVP

## Release C (Weeks 12–18)
- Managed onboarding program
- Marketing guidance hub
- Academy/workshops
- Website build services workflow
- Promotional tools suite
- E-book/webinar resource center

---

## Resourcing (Suggested)

- **Backend**: 3 engineers
- **Frontend**: 2 engineers (vendor/admin/storefront)
- **Data/Platform**: 1 engineer
- **Design/Product**: 1 designer + 1 PM
- **Ops Enablement**: 1 support lead + 1 onboarding specialist (for process definition)

---

## Success Metrics

- POS share of orders and checkout time
- Inventory sync SLA attainment and error rate
- Pick/pack accuracy and fulfillment lead time
- Invoice payment cycle time / aging reduction
- Support first response and resolution SLAs
- Fraud chargeback rate and prevented loss
- Onboarding time-to-first-sale
- Training completion rates and merchant retention
- Promo campaign adoption and incremental GMV

