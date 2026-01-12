import { model } from "@medusajs/framework/utils"

/**
 * CMS Category Attribute - Many-to-many relationship between categories and attributes
 * Defines which attributes are available for each category
 */
const CmsCategoryAttribute = model.define("cms_category_attribute", {
  id: model.id().primaryKey(),
  category_id: model.text(),
  attribute_id: model.text(),
  is_required: model.boolean().default(false),  // Override attribute default
  display_order: model.number().default(0),
})

export default CmsCategoryAttribute
