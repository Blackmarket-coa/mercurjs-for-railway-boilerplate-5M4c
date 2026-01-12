import { model } from "@medusajs/framework/utils"

/**
 * Attribute Input Type - How the attribute value is entered
 */
export enum AttributeInputType {
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  MULTISELECT = "multiselect",
  DATE = "date",
  DATETIME = "datetime",
  RANGE = "range",
  JSON = "json",
}

/**
 * Attribute Display Type - How the attribute is shown in filters
 */
export enum AttributeDisplayType {
  TEXT_INPUT = "text_input",
  NUMBER_INPUT = "number_input",
  CHECKBOX = "checkbox",
  DROPDOWN = "dropdown",
  RADIO = "radio",
  MULTISELECT = "multiselect",
  RANGE_SLIDER = "range_slider",
  DATE_PICKER = "date_picker",
  TAGS = "tags",
}

/**
 * CMS Attribute - Product/service attribute definitions
 * Examples: Price, Quantity/Weight, Freshness, Expiration Date, etc.
 */
const CmsAttribute = model.define("cms_attribute", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  input_type: model.enum(AttributeInputType).default(AttributeInputType.TEXT),
  display_type: model.enum(AttributeDisplayType).default(AttributeDisplayType.TEXT_INPUT),
  unit: model.text().nullable(),           // e.g., "lbs", "oz", "miles", "hours"
  options: model.json().nullable(),        // For select/multiselect: ["Option 1", "Option 2"]
  validation: model.json().nullable(),     // { min: 0, max: 100, required: true }
  is_filterable: model.boolean().default(true),
  is_required: model.boolean().default(false),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default CmsAttribute
