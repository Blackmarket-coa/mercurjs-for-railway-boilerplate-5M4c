import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, generateEntityId } from "@medusajs/framework/utils"
import {
  CMS_TYPES,
  CMS_CATEGORIES,
  CMS_TAGS,
  CMS_ATTRIBUTES,
  CMS_CATEGORY_TAG_MAPPINGS,
  CMS_CATEGORY_ATTRIBUTE_MAPPINGS,
} from "./cms-blueprint-data"

/**
 * Seed the CMS Blueprint data
 * Creates types, categories, tags, attributes, and their relationships
 */
export async function seedCmsBlueprint(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Starting CMS Blueprint seeding...")

  // Check if CMS types already exist
  const { data: existingTypes } = await query.graph({
    entity: "cms_type",
    fields: ["id"],
  })

  if (existingTypes && existingTypes.length > 0) {
    logger.info("CMS Blueprint data already exists, skipping seed...")
    return
  }

  // Get the CMS Blueprint service
  const cmsBlueprintService = container.resolve("cms-blueprint")

  // 1. Seed CMS Types
  logger.info("Seeding CMS Types...")
  for (const type of CMS_TYPES) {
    await cmsBlueprintService.createCmsTypes({
      id: type.id,
      handle: type.handle,
      name: type.name,
      description: type.description,
      icon: type.icon,
      display_order: type.display_order,
      is_active: type.is_active,
    })
  }
  logger.info(`Seeded ${CMS_TYPES.length} CMS Types`)

  // 2. Seed CMS Categories
  logger.info("Seeding CMS Categories...")
  for (const category of CMS_CATEGORIES) {
    await cmsBlueprintService.createCmsCategories({
      id: category.id,
      type_id: category.type_id,
      handle: category.handle,
      name: category.name,
      description: category.description,
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active,
    })
  }
  logger.info(`Seeded ${CMS_CATEGORIES.length} CMS Categories`)

  // 3. Seed CMS Tags
  logger.info("Seeding CMS Tags...")
  for (const tag of CMS_TAGS) {
    await cmsBlueprintService.createCmsTags({
      id: tag.id,
      handle: tag.handle,
      name: tag.name,
      tag_type: tag.tag_type,
      color: tag.color,
      is_active: true,
    })
  }
  logger.info(`Seeded ${CMS_TAGS.length} CMS Tags`)

  // 4. Seed CMS Attributes
  logger.info("Seeding CMS Attributes...")
  for (const attribute of CMS_ATTRIBUTES) {
    await cmsBlueprintService.createCmsAttributes({
      id: attribute.id,
      handle: attribute.handle,
      name: attribute.name,
      description: attribute.description,
      input_type: attribute.input_type,
      display_type: attribute.display_type,
      unit: attribute.unit,
      options: attribute.options,
      validation: attribute.validation,
      is_filterable: attribute.is_filterable,
      is_required: attribute.is_required,
      display_order: attribute.display_order,
      is_active: true,
    })
  }
  logger.info(`Seeded ${CMS_ATTRIBUTES.length} CMS Attributes`)

  // 5. Seed Category-Tag Mappings
  logger.info("Seeding Category-Tag Mappings...")
  for (const mapping of CMS_CATEGORY_TAG_MAPPINGS) {
    await cmsBlueprintService.createCmsCategoryTags({
      id: generateEntityId("", "cms_cat_tag"),
      category_id: mapping.category_id,
      tag_id: mapping.tag_id,
      is_default: false,
      display_order: 0,
    })
  }
  logger.info(`Seeded ${CMS_CATEGORY_TAG_MAPPINGS.length} Category-Tag Mappings`)

  // 6. Seed Category-Attribute Mappings
  logger.info("Seeding Category-Attribute Mappings...")
  for (const mapping of CMS_CATEGORY_ATTRIBUTE_MAPPINGS) {
    await cmsBlueprintService.createCmsCategoryAttributes({
      id: generateEntityId("", "cms_cat_attr"),
      category_id: mapping.category_id,
      attribute_id: mapping.attribute_id,
      is_required: mapping.is_required || false,
      display_order: 0,
    })
  }
  logger.info(`Seeded ${CMS_CATEGORY_ATTRIBUTE_MAPPINGS.length} Category-Attribute Mappings`)

  logger.info("CMS Blueprint seeding completed successfully!")
}

export default seedCmsBlueprint
