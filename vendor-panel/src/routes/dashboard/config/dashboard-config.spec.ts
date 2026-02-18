import { describe, expect, it } from "vitest"

import { type VendorFeatures } from "../../../providers/vendor-type-provider"
import { getOnboardingSteps, getPrimaryCTARoute } from "./dashboard-config"

const baseFeatures: VendorFeatures = {
  hasProducts: false,
  hasInventory: false,
  hasSeasons: false,
  hasVolunteers: false,
  hasMenu: false,
  hasDeliveryZones: false,
  hasDonations: false,
  hasSubscriptions: false,
  hasSupport: false,
  hasHarvests: false,
  hasPlots: false,
  hasRequests: false,
  hasFarm: false,
  hasShows: false,
}

describe("getPrimaryCTARoute", () => {
  it("uses route mappings for kitchen and mutual aid vendor types", () => {
    expect(getPrimaryCTARoute("kitchen")).toBe("/volunteers/schedule")
    expect(getPrimaryCTARoute("mutual_aid")).toBe("/inventory/create")
  })

  it("keeps product/menu routes for other vendor types", () => {
    expect(getPrimaryCTARoute("producer")).toBe("/products/create")
    expect(getPrimaryCTARoute("garden")).toBe("/products/create")
    expect(getPrimaryCTARoute("maker")).toBe("/products/create")
    expect(getPrimaryCTARoute("restaurant")).toBe("/menu/items")
    expect(getPrimaryCTARoute("default")).toBe("/products/create")
  })
})

describe("getOnboardingSteps extension coverage", () => {
  it("adds seasons step when hasSeasons is enabled", () => {
    const steps = getOnboardingSteps("producer", {
      ...baseFeatures,
      hasSeasons: true,
    })

    expect(steps.some((step) => step.key === "seasons" && step.to === "/order-cycles")).toBe(true)
  })

  it("adds harvests step when hasHarvests is enabled", () => {
    const steps = getOnboardingSteps("producer", {
      ...baseFeatures,
      hasHarvests: true,
    })

    expect(steps.some((step) => step.key === "harvests" && step.to === "/farm/harvests/create")).toBe(true)
  })

  it("adds support step when hasSupport is enabled", () => {
    const steps = getOnboardingSteps("maker", {
      ...baseFeatures,
      hasSupport: true,
    })

    expect(steps.some((step) => step.key === "support" && step.to === "/messages")).toBe(true)
  })
})
