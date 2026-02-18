export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>

export type WebsiteEventName =
  | "homepage_vendor_type_selected"
  | "feature_matrix_viewed"
  | "dashboard_showcase_opened"
  | "pricing_breakdown_expanded"
  | "why_we_exist_cta_clicked"
  | "github_transparency_link_clicked"
  | "homepage_search_submitted"
  | "homepage_quick_filter_used"
  | "homepage_primary_cta_clicked"
  | "homepage_secondary_cta_clicked"
  | "homepage_first_session_progression"

export const emitWebsiteEvent = (name: WebsiteEventName, payload: AnalyticsPayload = {}) => {
  if (typeof window === "undefined") return

  const deviceType = window.matchMedia("(max-width: 768px)").matches
    ? "mobile"
    : "desktop"

  const eventPayload = {
    event: name,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    deviceType,
    ...payload,
  }

  // Keep this interoperable with common analytics integrations.
  const windowWithDataLayer = window as Window & {
    dataLayer?: Record<string, unknown>[]
  }

  windowWithDataLayer.dataLayer = windowWithDataLayer.dataLayer || []
  windowWithDataLayer.dataLayer.push(eventPayload)

  window.dispatchEvent(
    new CustomEvent("website-analytics-event", {
      detail: eventPayload,
    })
  )

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", eventPayload)
  }
}
