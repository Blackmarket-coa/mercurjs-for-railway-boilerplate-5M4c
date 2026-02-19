# Website Positioning KPI Review Cadence

## Purpose
Operationalize the “ongoing KPI review and iteration cycle” called out in `docs/WEBSITE_POSITIONING_ALIGNMENT_PLAN.md` so the team has a repeatable weekly loop, clear owners, and explicit experiment rules.

## Scope
This cadence covers the conversion instrumentation events introduced in the website positioning plan and the conversion surfaces they map to:

- Homepage discovery module (search + quick filters)
- CTA hierarchy (buyer and seller paths)
- Vendor onboarding start and progression
- Vendor dashboard showcase engagement
- Pricing transparency interactions
- Mission/transparency link engagement

## Metrics and Event Map

### Primary KPI Set
1. **Vendor signup conversion rate**
   - Definition: sessions with `signup_start` / sessions with vendor-intent CTA click
2. **Signup completion rate**
   - Definition: completed payout connection / account created
3. **Vendor-type entry point CTR**
   - Definition: clicks on vendor-type cards / homepage sessions
4. **Feature proof engagement**
   - Definition: views of feature matrix and dashboard showcase sections

### Supporting KPI Set
1. Homepage search usage rate (`homepage_search_submitted`)
2. Quick-filter interaction rate (`homepage_quick_filter_used`)
3. CTA split performance
   - Primary: `homepage_primary_cta_clicked`
   - Secondary: `homepage_secondary_cta_clicked`
4. Pricing trust interactions (`pricing_breakdown_expanded`)
5. Mission/transparency engagement
   - `why_we_exist_cta_clicked`
   - `github_transparency_link_clicked`
6. Dashboard showcase visibility (`dashboard_showcase_opened`)

## Operating Rhythm

### Weekly Cadence
- **Monday (Data Pull + QA, 30 min):**
  - Confirm all expected events are still flowing.
  - Validate no schema drift in event payloads.
- **Tuesday (KPI Review, 45 min):**
  - Compare week-over-week and 4-week trend lines.
  - Segment by device type (desktop/mobile).
- **Wednesday (Hypothesis + Experiment Design, 45 min):**
  - Select one primary and one secondary hypothesis.
  - Define success criteria before implementation.
- **Thursday–Friday (Implement + Annotate):**
  - Ship experiment behind a small, reversible change.
  - Add release annotation in analytics dashboard.

### Monthly Cadence
- Run one deeper funnel review:
  - Homepage → discovery interaction → product detail/signup start → payout connected
- Archive “kept,” “reverted,” and “needs follow-up” experiments.

## Ownership Model
- **Growth/PM:** Sets weekly hypotheses and decides priorities.
- **Engineering:** Verifies event integrity and ships experiment changes.
- **Design/Content:** Provides copy/layout variants and usability rationale.
- **Analytics owner (or delegated engineer):** Maintains dashboard definitions and QA checks.

## Experiment Rules (Guardrails)
1. Always keep one stable control period for comparison.
2. Do not change event names without updating this document and analytics dashboard mappings.
3. Ship only claims that reflect real, currently available capabilities.
4. Require mobile and accessibility pass for any homepage CTA/discovery change.
5. For pricing copy tests, preserve visible “3% / 97%” transparency language.

## Weekly Review Template
Use this structure in notes/issues:

1. **What changed last week?**
2. **What moved?**
   - KPI deltas (WoW and 4-week trend)
3. **Why do we think it moved?**
4. **What do we test next?**
5. **Ship decision:** keep, iterate, or revert.

## Baseline Dashboard Requirements
At minimum, ensure one dashboard includes:

- Time-series for all primary and supporting KPI events
- Device segmentation (desktop/mobile)
- Landing-page segmentation (homepage, sell page, vendor-types page)
- Release markers/annotations for each experiment deployment

## Immediate Next Two Iterations
1. **Iteration A (Discovery-first):**
   - Test tighter search helper text + filter chip ordering.
   - Success signal: lift in `homepage_search_submitted` and downstream product detail views.
2. **Iteration B (Trust-first):**
   - Test pricing/trust block placement above vs below first CTA cluster.
   - Success signal: lift in seller CTA clicks and signup start rate.
