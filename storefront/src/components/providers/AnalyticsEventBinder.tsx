"use client"

import { useEffect, useRef } from "react"
import { emitWebsiteEvent, type WebsiteEventName } from "@/lib/analytics/events"

const WEBSITE_EVENTS = new Set<WebsiteEventName>([
  "homepage_vendor_type_selected",
  "feature_matrix_viewed",
  "dashboard_showcase_opened",
  "pricing_breakdown_expanded",
  "why_we_exist_cta_clicked",
  "github_transparency_link_clicked",
  "homepage_search_submitted",
  "homepage_quick_filter_used",
  "homepage_primary_cta_clicked",
  "homepage_secondary_cta_clicked",
  "homepage_first_session_progression",
])

const asWebsiteEventName = (value: string | undefined): WebsiteEventName | null => {
  if (!value) return null
  return WEBSITE_EVENTS.has(value as WebsiteEventName)
    ? (value as WebsiteEventName)
    : null
}

export const AnalyticsEventBinder = () => {
  const firstSessionProgressTracked = useRef(false)

  useEffect(() => {
    const observed = new Set<HTMLElement>()

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const eventElement = target.closest<HTMLElement>("[data-event]")
      const eventName = asWebsiteEventName(eventElement?.dataset.event)

      if (eventName) {
        emitWebsiteEvent(eventName, {
          label: eventElement?.dataset.eventLabel ?? null,
        })
      }

      const progressionElement = target.closest<HTMLElement>("[data-progress-target]")
      if (!progressionElement || firstSessionProgressTracked.current) return

      firstSessionProgressTracked.current = true
      emitWebsiteEvent("homepage_first_session_progression", {
        target: progressionElement.dataset.progressTarget ?? "unknown",
      })
    }

    document.addEventListener("click", handleClick)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const element = entry.target as HTMLElement
          const eventName = asWebsiteEventName(element.dataset.event)
          if (!eventName || observed.has(element)) return

          observed.add(element)
          emitWebsiteEvent(eventName, {
            label: element.dataset.eventLabel ?? null,
          })
          observer.unobserve(element)
        })
      },
      { threshold: 0.4 }
    )

    document.querySelectorAll<HTMLElement>("[data-event-on-view='true']").forEach((element) => {
      observer.observe(element)
    })

    return () => {
      document.removeEventListener("click", handleClick)
      observer.disconnect()
    }
  }, [])

  return null
}
