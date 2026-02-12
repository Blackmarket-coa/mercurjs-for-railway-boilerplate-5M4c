import { ReadonlyURLSearchParams } from "next/navigation"

const getOption = (label: string) => {
  switch (label) {
    case "size":
      return "variants.size"
    case "color":
      return "variants.color"
    case "condition":
      return "variants.condition"
    case "vendor_type":
      return "seller.vendor_type"
    case "rating":
      return "average_rating"
    case "category":
    case "categories":
      return "categories.name"
    case "type":
    case "product_type":
      return "type.value"
    case "sales_channel":
    case "sales_channel_id":
      return "sales_channels.name"
    default:
      return ""
  }
}

export const getFacedFilters = (filters: ReadonlyURLSearchParams): string => {
  const facets: string[] = []

  let minPrice = null
  let maxPrice = null

  let rating = ""

  for (const [key, value] of filters.entries()) {
    if (
      key !== "min_price" &&
      key !== "max_price" &&
      key !== "sale" &&
      key !== "query" &&
      key !== "page" &&
      key !== "products[page]" &&
      key !== "sortBy" &&
      key !== "rating"
    ) {
      const filterKey = getOption(key)

      if (!filterKey) {
        continue
      }

      const splitValues = value.split(",")
      const facetValues = splitValues
        .filter(Boolean)
        .map((item) => `${filterKey}:"${item}"`)

      if (!facetValues.length) {
        continue
      }

      facets.push(
        facetValues.length > 1
          ? `(${facetValues.join(" OR ")})`
          : facetValues[0]
      )
    } else {
      if (key === "min_price") minPrice = value
      if (key === "max_price") maxPrice = value

      if (key === "rating") {
        const splitValues = value.split(",").filter(Boolean)

        if (!splitValues.length) {
          rating = ""
          continue
        }

        const values = splitValues
          .map((item) => `${getOption(key)} >= ${item}`)
          .join(" OR ")

        rating = `(${values})`
      }
    }
  }

  const facetFilter = facets.length ? `(${facets.join(" AND ")})` : ""

  const priceFilter =
    minPrice && maxPrice
      ? `variants.prices.amount:${minPrice} TO ${maxPrice}`
      : minPrice
      ? `variants.prices.amount >= ${minPrice}`
      : maxPrice
      ? `variants.prices.amount <= ${maxPrice}`
      : ""

  return [facetFilter, priceFilter, rating].filter(Boolean).join(" AND ")
}
