import { model } from "@medusajs/framework/utils"

/**
 * CMS Category Tag - Many-to-many relationship between categories and tags
 * Defines which tags are available for each category
 */
const CmsCategoryTag = model.define("cms_category_tag", {
  id: model.id().primaryKey(),
  category_id: model.text(),
  tag_id: model.text(),
  is_default: model.boolean().default(false),  // Pre-selected tag for new items
  display_order: model.number().default(0),
})

export default CmsCategoryTag
