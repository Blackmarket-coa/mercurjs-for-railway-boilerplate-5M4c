import { model } from "@medusajs/framework/utils"

/**
 * Tag Type - Classifies what kind of tag this is
 */
export enum TagType {
  DIETARY = "dietary",           // Organic, Vegan, Gluten-Free, Keto, Low-Sugar
  AVAILABILITY = "availability", // In-stock, Pre-order, Seasonal
  SOURCE = "source",             // Farm, Artisan, Nonprofit, Maker
  FULFILLMENT = "fulfillment",   // Delivery, Pickup, Local Only
  PRICING = "pricing",           // Bulk Sale, Fair Trade
  ORGANIZATION = "organization", // Volunteer-needed, Donation, Open, Membership
  LOCATION = "location",         // City, Neighborhood, Region, Zip code
  SERVICE = "service",           // On-demand, Scheduled, Distance radius
  FACILITY = "facility",         // Shared Kitchen, Equipment Access, Workshops
  CONDITION = "condition",       // New, Used, Refurbished
  PORTION = "portion",           // Single, Family, Bulk
}

/**
 * CMS Tag - Labels/filters that can be applied to products/services
 */
const CmsTag = model.define("cms_tag", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  tag_type: model.enum(TagType).default(TagType.AVAILABILITY),
  icon: model.text().nullable(),
  color: model.text().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default CmsTag
