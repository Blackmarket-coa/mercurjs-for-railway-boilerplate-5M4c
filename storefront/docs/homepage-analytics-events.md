# Homepage Analytics Events

This document describes the stable event names and payloads emitted from homepage conversion instrumentation.

## Event transport

All events are pushed to `window.dataLayer` and dispatched as a `website-analytics-event` browser event with a common payload.

Common payload fields:
- `event`: stable event name
- `timestamp`: ISO timestamp
- `path`: current pathname
- `deviceType`: `desktop` or `mobile`

## Event reference

| Event name | Trigger | Payload additions |
| --- | --- | --- |
| `homepage_search_submitted` | Search form submit in discovery module | `query` |
| `homepage_quick_filter_used` | Quick filter click in discovery module | `filter` |
| `homepage_primary_cta_clicked` | Primary conversion CTA click from homepage sections | `cta` or `label` |
| `homepage_secondary_cta_clicked` | Secondary CTA click from pathways and shortcuts | `label` |
| `homepage_first_session_progression` | First click from homepage toward product discovery or signup path | `target` |
| `homepage_vendor_type_selected` | Vendor type card click | `label` (if provided) |
| `pricing_breakdown_expanded` | Pricing breakdown disclosure interaction | `label` (if provided) |
| `github_transparency_link_clicked` | GitHub transparency CTA click | `label` (if provided) |

## Device segmentation

Device segmentation is attached to every event using a viewport breakpoint check (`<= 768px` => mobile). This enables desktop/mobile baseline comparisons for pre/post release analysis.
