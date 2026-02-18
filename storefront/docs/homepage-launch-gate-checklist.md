# Homepage Launch Gate Checklist (Week 1)

This checklist maps directly to the Immediate Sprint launch gates in `docs/WEBSITE_POSITIONING_ALIGNMENT_PLAN.md`.

## Mobile UX checks
- [ ] Touch targets are easy to tap for homepage search, quick filters, and primary/secondary CTAs.
- [ ] Search and filter controls remain readable at common mobile breakpoints (360px–430px widths).
- [ ] Trending and Best Sellers shortcuts remain visible and usable on mobile.

## Accessibility checks
- [ ] Color contrast is acceptable for CTA text and chips.
- [ ] Core homepage actions are keyboard reachable (hero CTAs, discovery search submit, quick filters).
- [ ] Heading order is semantic and sequential.

## Performance checks
- [ ] Listing sections render a non-blocking state (no permanent empty/blocked view).
- [ ] Homepage does not show a blocking empty state while data is loading.
- [ ] Discovery module appears above the fold in standard desktop viewport.

## Instrumentation baseline window
- [ ] Capture at least 7 days of baseline metrics before/after release comparison.
- [ ] Segment event analysis by `deviceType` (`desktop`/`mobile`).

## Primary events to monitor during the window
- `homepage_search_submitted`
- `homepage_quick_filter_used`
- `homepage_primary_cta_clicked`
- `homepage_secondary_cta_clicked`
- `homepage_first_session_progression`
