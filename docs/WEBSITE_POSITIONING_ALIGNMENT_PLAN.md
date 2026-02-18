# Free Black Market Website Positioning Alignment Plan

## Objective
Align the public website with the product reality in the codebase: a **community commerce infrastructure platform** (not only a marketplace), while improving conversion, trust, and onboarding clarity.

## Core Repositioning Statement
Use this as the top-line narrative across homepage, vendor landing pages, onboarding, and about pages:

> **One platform for producers, creators, organizers, and service providers.**
> 
> Sell goods, offer services, run subscriptions, manage CSA shares, host events, and track community impact — while keeping **97%** of every sale.

---

## Scope and Deliverables

### 1) Reposition Platform Messaging
**Goal:** Shift perception from “basic marketplace” to “community commerce infrastructure.”

**Deliverables**
- New homepage section: **Built for Community Commerce**.
- Supporting copy blocks for:
  - Products
  - Services
  - Subscriptions/CSA
  - Events/tickets
  - Rentals
  - Community programs
  - Impact tracking
- Updated hero/subhero language to foreground infrastructure + mission.

**Acceptance Criteria**
- Homepage above-the-fold and first 2 sections clearly mention at least 4 non-marketplace capabilities.
- “Community commerce” phrase appears in hero or immediate follow-up section.

---

### 2) Add Vendor-Type Entry Points
**Goal:** Help visitors self-identify quickly and reduce confusion about platform fit.

**Deliverables**
- New section: **What Are You Selling?**
- CTA cards/buttons for:
  - Physical Goods
  - Services
  - CSA / Subscriptions
  - Digital Products
  - Event Tickets
  - Rentals
  - Community Programs
- Dedicated explainer pages (or anchored sections) for each type with setup, workflow, and fee model.

**Acceptance Criteria**
- Every card links to a tailored destination page/section.
- Each destination includes “How it works,” “Who this is for,” and “Example use case.”

---

### 3) Showcase Vendor Dashboard and Operations
**Goal:** Increase trust by making the operational system visible.

**Deliverables**
- “Inside the Vendor Dashboard” visual section.
- Annotated screenshots (or short GIFs) showing:
  - Order management
  - Payout tracking
  - Messaging
  - Impact metrics
- Stripe Connect value props:
  - Automated payouts
  - Transparent fees
  - Vendor-controlled fulfillment

**Acceptance Criteria**
- At least 4 real UI screenshots are visible on public pages.
- Each screenshot has a caption tied to vendor outcomes.

---

### 4) Reframe 97% Payout as a Trust Anchor
**Goal:** Make pricing transparent and memorable.

**Deliverables**
- Primary pricing statement:
  - **“We take 3%. You keep 97%. No hidden platform tricks.”**
- Fee breakdown module with simple math examples.
- Competitive comparison snippet (without naming competitors if legal/brand prefers).

**Acceptance Criteria**
- Pricing statement appears on homepage + vendor signup funnel.
- Fee example appears adjacent to pricing statement.

---

### 5) Publish Explicit Feature Matrix
**Goal:** Turn implied capability into visible proof.

**Deliverables**
- New feature matrix section/page listing:
  - Multi-vendor storefront
  - Stripe direct payouts
  - Subscriptions
  - CSA share management
  - Event ticketing
  - Digital downloads
  - Local pickup/delivery
  - Vendor messaging
  - Impact tracking
- Optional “Available now / in rollout” labels.

**Acceptance Criteria**
- Matrix is accessible from homepage nav and vendor onboarding pages.
- Matrix rows map to real product capabilities only.

---

### 6) Add Community Infrastructure Narrative
**Goal:** Differentiate from generic ecommerce platforms.

**Deliverables**
- New page: **Beyond Selling: Build Community Economy**.
- Content modules explaining support for:
  - Co-ops
  - Community gardens
  - Shared kitchens
  - Shared/local resource systems
- Case-style examples (pilot formats acceptable initially).

**Acceptance Criteria**
- Page clearly states: “This is infrastructure for local economic networks, not just storefront software.”

---

### 7) Improve Onboarding Narrative
**Goal:** Reduce complexity while preserving power.

**Deliverables**
- 4-step visual flow:
  1. Create account
  2. Connect payouts
  3. Choose what you sell
  4. Launch storefront
- Expand/collapse “Advanced tools available anytime” section for subscriptions/events/impact.

**Acceptance Criteria**
- Flow is visible on signup landing page.
- Advanced tools are presented as optional, not blocking.

---

### 8) Add Trust and Stability Signals
**Goal:** Recover confidence after onboarding issues and reinforce transparency.

**Deliverables**
- Reliability copy block:
  - “Improved onboarding system”
  - “Built on scalable open-source infrastructure”
- Public GitHub link and transparency callout.
- Badge treatment: **Open Source. Community Governed.**

**Acceptance Criteria**
- Trust callout appears near signup CTAs and footer/about area.
- GitHub transparency link is visible from homepage.

---

### 9) Organize Scope into Intentional Buckets
**Goal:** Make breadth feel coherent instead of random.

**Deliverables**
- Information architecture grouping all offerings under:
  - Goods
  - Services
  - Community Programs
- Update navigation labels and homepage sections to follow this taxonomy.

**Acceptance Criteria**
- Each major capability fits clearly into one bucket.
- Navigation and feature pages use the same category language.

---

### 10) Add “Why We Exist” Page
**Goal:** Lead with mission and governance, not just tooling.

**Deliverables**
- New page: **Why We Exist** covering:
  - Why 3%
  - Why community ownership/governance
  - What market problem is being solved
- Strong CTA: “Join as a vendor” + “Contribute on GitHub.”

**Acceptance Criteria**
- Mission page linked from header/footer.
- Clear narrative bridge between values and product features.

---

## Recommended Delivery Sequence (6 Weeks)

### Phase 1 (Week 1–2): Narrative + IA Foundation
- Repositioning copy updates
- New category framing (Goods / Services / Community Programs)
- 97% pricing trust anchor
- “What Are You Selling?” section skeleton

### Phase 2 (Week 3–4): Capability Proof
- Feature matrix
- Dashboard visuals and Stripe payout explainer
- Vendor-type explainer pages

### Phase 3 (Week 5–6): Mission + Trust Reinforcement
- “Beyond Selling” page
- “Why We Exist” page
- Open-source trust signals and onboarding reliability copy
- Final onboarding flow visual refinement

---

## Measurement Plan

### Primary KPIs
- Vendor signup conversion rate
- Signup completion rate (account created → payout connected)
- CTA click-through on vendor-type entry points
- Time on page for feature matrix and mission pages

### Secondary KPIs
- Reduced bounce rate on homepage/vendor landing pages
- Increased clicks to GitHub transparency link
- Increased engagement with dashboard showcase assets

### Suggested Instrumentation Events
- `homepage_vendor_type_selected`
- `feature_matrix_viewed`
- `dashboard_showcase_opened`
- `pricing_breakdown_expanded`
- `why_we_exist_cta_clicked`
- `github_transparency_link_clicked`

---

## Content/Design System Notes
- Keep language plain and specific (avoid vague “all-in-one marketplace” claims).
- Prefer real UI screenshots over abstract illustrations.
- Use consistent naming for capability types across pages and CTAs.
- Keep the 3%/97% math visible wherever vendor conversion decisions occur.

## Risks and Mitigations
- **Risk:** Overwhelming new visitors with too many capabilities.
  - **Mitigation:** Progressive disclosure (simple 4-step onboarding + optional advanced tools).
- **Risk:** Claims drift beyond current implementation.
  - **Mitigation:** Feature matrix tied to verified shipped functionality.
- **Risk:** Broad scope delays release.
  - **Mitigation:** Ship in three phases with homepage-first priorities.

## Definition of Done
- Public website messaging consistently reflects platform depth.
- Vendor persona entry points are live and trackable.
- Pricing model is transparent and trust-building.
- Community infrastructure and mission pages are published.
- Conversion instrumentation is in place for post-launch iteration.

---

## UI/UX Conversion Audit Addendum (freeblackmarket.com)

This section incorporates a practical UX + conversion audit of the publicly visible marketplace experience and maps findings into the plan backlog.

### 1) First Impression & Clarity of Purpose

**What is working**
- The value proposition is visible early and communicates community ownership and marketplace intent.
- Primary CTAs like “Explore the Marketplace” and “See How It Works” provide an immediate next step.

**Improvement opportunity**
- Refine hero copy to be more action-oriented and benefit-led (e.g., shopper outcomes, uniqueness, trust, speed).

**Plan impact**
- Strengthens Scope Item 1 (Reposition Platform Messaging) with conversion-focused copy testing.

### 2) Navigation & Product Discovery

**Observation**
- Navigation links are present, but discovery can be improved by making search + filters more prominent above the fold.

**Improvement opportunity**
- Add a prominent search module and quick filters (category, price, local pickup, vendor type) near the top of browse surfaces.

**Plan impact**
- Add to Phase 1 IA Foundation and Phase 2 Capability Proof as a homepage + catalog priority.

### 3) CTA Hierarchy & Visual Priority

**What is working**
- Marketplace and seller CTAs exist and are understandable.

**Improvement opportunity**
- Increase CTA contrast, spacing, and hierarchy to separate primary from secondary actions.
- Add first-time buyer CTAs (e.g., “Shop Trending,” “Browse Best Sellers”).

**Plan impact**
- Extends Scope Items 2 and 7 with explicit CTA hierarchy and first-visit action paths.

### 4) Listings Quality & Trust Signals

**Observation**
- Placeholder/test-like listings reduce perceived trust.
- Trust indicators (ratings, reviews, seller credibility markers) are not yet prominent.

**Improvement opportunity**
- Prioritize real featured listings with polished imagery, complete titles, and clear pricing.
- Add seller badges, ratings/reviews, and trust microcopy where data exists.

**Plan impact**
- Expands Scope Items 3, 5, and 8 to include marketplace trust modules on homepage/product discovery pages.

### 5) Performance & Loading Feedback

**Observation**
- No obvious visual blocker from static audit, but performance and loading feedback remain conversion-critical.

**Improvement opportunity**
- Add skeleton/loading states for key listing modules and track Largest Contentful Paint (LCP) + interaction latency on marketplace entry routes.

**Plan impact**
- Add technical UX acceptance criteria to Phase 2 rollout quality gates.

### 6) Mobile Responsiveness & Accessibility

**Observation**
- Mobile flow and accessibility details require explicit validation passes.

**Improvement opportunity**
- Validate card readability, touch target sizes, sticky filter/sort behavior, and CTA prominence on mobile breakpoints.
- Run accessibility checks for color contrast, keyboard navigation, and semantic heading structure.

**Plan impact**
- Add cross-device QA checklist to Definition of Done and launch gating.

### 7) First-Time User Onboarding Flow

**Observation**
- New users have CTAs but limited guided context about what to do next.

**Improvement opportunity**
- Add a first-visit guided flow (modal, banner, or progressive prompt):
  1. How to browse
  2. How to buy
  3. How to sell

**Plan impact**
- Extends Scope Item 7 (4-step onboarding) with a first-visit buyer/seller orientation layer.

## Priority Backlog Additions (High Impact)

1. **Prominent search + filters above the fold** on homepage and catalog entry.
2. **CTA hierarchy update** (contrast, primary/secondary distinction, first-time buyer shortcuts).
3. **Trust layer for listings** (real featured products, ratings/reviews/badges where available).
4. **Mobile + accessibility quality gate** before major homepage conversion experiments.
5. **First-visit guided orientation** for browsing, buying, and selling actions.

## Suggested Success Metrics for This Addendum

- Search usage rate from homepage.
- Filter interaction rate and downstream product detail clicks.
- CTR lift on primary CTAs after hierarchy refresh.
- Bounce-rate reduction on mobile homepage traffic.
- First-session progression rate (homepage → product detail or signup start).

## Immediate Implementation Sprint (Next Step)

Execute these items first (Week 1) so the team can ship measurable conversion improvements quickly.

### Sprint Goal
Ship a homepage conversion foundation release with instrumentation, improved discovery, clearer CTA hierarchy, and trust-ready listing presentation.

### Workstream A — Instrumentation First
**Tasks**
1. Add event hooks for homepage search submission and quick-filter usage.
2. Add event hooks for primary and secondary hero CTA clicks.
3. Add event hook for first-session progression (homepage → product detail or signup start).

**Acceptance Criteria**
- Events are emitted with stable names and documented payloads.
- Dashboard or log query can segment by device type (desktop/mobile).
- Baseline metrics are captured for at least 7 days pre/post release comparison.

### Workstream B — Above-the-Fold Discovery Module
**Tasks**
1. Add a prominent search bar near the hero area.
2. Add quick filters (category, price, local pickup, vendor type).
3. Add “Trending” and “Best Sellers” shortcuts for first-time buyers.

**Acceptance Criteria**
- Discovery module is visible without scrolling on common desktop viewport sizes.
- Mobile layout preserves readability and touch-friendly controls.
- Search and filter interactions are tracked by instrumentation events.

### Workstream C — CTA Hierarchy Refresh
**Tasks**
1. Set a single primary CTA and one clearly secondary CTA in hero and first content block.
2. Increase contrast/spacing to visually distinguish conversion-priority action.
3. Validate CTA label clarity for buyers vs sellers.

**Acceptance Criteria**
- CTA visual priority is consistent across homepage sections.
- First-time visitors can identify buyer path and seller path within 5 seconds.
- CTR baseline and post-change CTR are directly comparable via analytics.

### Workstream D — Listing Trust Readiness
**Tasks**
1. Replace placeholder/test-style featured listings with real curated items.
2. Ensure complete metadata on cards (image, title, price, seller name).
3. Add trust indicators where available (seller badge, rating/review count).

**Acceptance Criteria**
- No placeholder/test products appear in featured marketplace rows.
- All featured cards meet minimum quality standards (image + title + price).
- Trust markers degrade gracefully if data is unavailable.

### Launch Gate Checklist (Must Pass)
- Mobile checks: touch target size, text legibility, filter usability.
- Accessibility checks: color contrast, keyboard navigation, heading order.
- Performance checks: loading state present for listings; no blocking empty states.

---

## Remaining Work After This Next Step

After the immediate sprint ships, the following items remain from the broader plan:

1. Full feature matrix publication and nav integration.
2. Vendor dashboard public showcase with annotated real screenshots.
3. “Beyond Selling” page and “Why We Exist” page content + linking.
4. Expanded onboarding flow (4-step visual + optional advanced tools panel).
5. Open-source trust and reliability messaging rollout in footer/about/signup surfaces.
6. Cross-page taxonomy normalization (Goods / Services / Community Programs).
7. Ongoing KPI review and iteration cycle across conversion metrics.

