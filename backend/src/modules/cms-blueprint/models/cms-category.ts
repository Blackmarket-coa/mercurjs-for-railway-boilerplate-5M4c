import { model } from "@medusajs/framework/utils"

/**
 * CMS Category - Second-level classification under a Type
 * Examples: Under "Food & Produce": Fruits, Vegetables, Grains & Legumes, etc.
 */
const CmsCategory = model.define("cms_category", {
  id: model.id().primaryKey(),
  type_id: model.text(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  icon: model.text().nullable(),
  image_url: model.text().nullable(),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default CmsCategory
