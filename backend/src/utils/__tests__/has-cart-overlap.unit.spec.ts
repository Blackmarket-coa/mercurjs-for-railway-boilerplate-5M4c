import hasCartOverlap from "../has-cart-overlap"

describe("hasCartOverlap", () => {
  const requestedItem = {
    variant_id: "variant_1",
    rental_start_date: new Date("2026-03-10"),
    rental_end_date: new Date("2026-03-15"),
    rental_days: 5,
  }

  it("returns true when matching variant rental dates overlap", () => {
    const cartItems = [
      {
        id: "item_1",
        variant_id: "variant_1",
        metadata: {
          rental_start_date: "2026-03-12",
          rental_end_date: "2026-03-18",
          rental_days: 6,
        },
      },
    ]

    expect(hasCartOverlap(requestedItem, cartItems)).toBe(true)
  })

  it("returns false when variant differs", () => {
    const cartItems = [
      {
        id: "item_1",
        variant_id: "variant_other",
        metadata: {
          rental_start_date: "2026-03-12",
          rental_end_date: "2026-03-18",
          rental_days: 6,
        },
      },
    ]

    expect(hasCartOverlap(requestedItem, cartItems)).toBe(false)
  })

  it("returns false when metadata is missing required rental fields", () => {
    const cartItems = [
      {
        id: "item_1",
        variant_id: "variant_1",
        metadata: {
          rental_start_date: "2026-03-12",
        },
      },
    ]

    expect(hasCartOverlap(requestedItem, cartItems)).toBe(false)
  })
})
