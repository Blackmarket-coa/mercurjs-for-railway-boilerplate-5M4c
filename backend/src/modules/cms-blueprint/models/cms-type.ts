import { model } from "@medusajs/framework/utils"

/**
 * CMS Type - Top-level product/service classification
 * Examples: Food & Produce, Prepared Foods & Meals, Supplies & Goods, etc.
 */
const CmsType = model.define("cms_type", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  icon: model.text().nullable(),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default CmsType
