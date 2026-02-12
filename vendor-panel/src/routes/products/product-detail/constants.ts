import { getLinkedFields } from "../../../extensions"

const FORBIDDEN_FIELDS = new Set([
  "attribute_values.*",
  "attribute_values.attribute.*",
  "+attribute_values.*",
  "+attribute_values.attribute.*",
])

const getSafeProductDetailFields = () => {
  const linkedFields = getLinkedFields("product", "*variants.inventory_items,*categories")

  return linkedFields
    .split(",")
    .map((field) => field.trim())
    .filter((field) => field.length > 0)
    .filter((field) => !FORBIDDEN_FIELDS.has(field))
    .join(",")
}

export const PRODUCT_DETAIL_FIELDS = getSafeProductDetailFields()
