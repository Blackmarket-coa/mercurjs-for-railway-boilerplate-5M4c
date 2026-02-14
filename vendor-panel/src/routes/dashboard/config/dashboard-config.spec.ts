import { describe, expect, it } from "vitest"

import { getPrimaryCTARoute } from "./dashboard-config"

describe("getPrimaryCTARoute", () => {
  it("uses inventory create route for inventory-centric vendor types", () => {
    expect(getPrimaryCTARoute("kitchen")).toBe("/inventory/create")
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
