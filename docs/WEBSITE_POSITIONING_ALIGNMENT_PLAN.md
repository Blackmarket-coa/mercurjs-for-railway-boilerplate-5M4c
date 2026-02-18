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
