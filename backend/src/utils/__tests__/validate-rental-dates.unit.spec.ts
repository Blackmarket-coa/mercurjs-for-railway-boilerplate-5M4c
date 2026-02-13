import { MedusaError } from "@medusajs/framework/utils"

import validateRentalDates from "../validate-rental-dates"

describe("validateRentalDates", () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const inThreeDays = new Date(today)
  inThreeDays.setDate(today.getDate() + 3)

  it("accepts valid rental period", () => {
    expect(() =>
      validateRentalDates(tomorrow, inThreeDays, { min_rental_days: 1, max_rental_days: 7 }, 2)
    ).not.toThrow()
  })

  it("rejects rental shorter than minimum days", () => {
    expect(() =>
      validateRentalDates(tomorrow, inThreeDays, { min_rental_days: 3, max_rental_days: 7 }, 2)
    ).toThrow(MedusaError)
  })

  it("rejects rental longer than maximum days", () => {
    expect(() =>
      validateRentalDates(tomorrow, inThreeDays, { min_rental_days: 1, max_rental_days: 1 }, 2)
    ).toThrow("exceeds the maximum")
  })

  it("rejects past rental dates", () => {
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    expect(() =>
      validateRentalDates(yesterday, tomorrow, { min_rental_days: 1, max_rental_days: null }, 1)
    ).toThrow("cannot be in the past")
  })

  it("rejects end date before start date", () => {
    expect(() =>
      validateRentalDates(inThreeDays, tomorrow, { min_rental_days: 1, max_rental_days: null }, 2)
    ).toThrow("must be after")
  })
})
