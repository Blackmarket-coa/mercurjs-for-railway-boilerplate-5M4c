import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Product type definitions for the marketplace.
 * These align with the ProductArchetype system but are the Medusa-native
 * product types that appear in the admin/vendor dashboard Product Types pages.
 */
const PRODUCT_TYPES = [
  { value: "food", metadata: { allow_internal_fulfillment: true, community_priority: true } },
  { value: "land_access", metadata: { allow_internal_fulfillment: true, inventory_tracking: false, reservation_required: true } },
  { value: "tools_and_infrastructure", metadata: { allow_internal_fulfillment: true } },
  { value: "electronics_and_networks", metadata: { allow_internal_fulfillment: true } },
  { value: "digital_services", metadata: { allow_internal_fulfillment: true, digital: true } },
  { value: "community_and_events", metadata: { allow_internal_fulfillment: true, capacity_based: true } },
  { value: "mutual_aid", metadata: { allow_internal_fulfillment: true, manual_fulfillment_required: true, community_priority: true } },
  { value: "circular_economy", metadata: { allow_internal_fulfillment: true, requires_condition_grade: true } },
  { value: "membership", metadata: { allow_internal_fulfillment: true, digital: true } },
  { value: "experimental", metadata: { allow_internal_fulfillment: true, requires_governance_review: true } },
]

/**
 * This loader ensures that product types exist in the database.
 * It runs on backend startup and creates any missing product types.
 *
 * This is necessary because:
 * 1. The seed script may not have been run
 * 2. The seed script skips if any product types exist (even if incomplete)
 * 3. New product types may be added in updates
 */
export default async function initProductTypes(
  container: MedusaContainer
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const productModuleService = container.resolve(Modules.PRODUCT)

    // Get existing product types
    const existingTypes = await productModuleService.listProductTypes({})
    const existingValues = new Set(existingTypes.map((t: any) => t.value))

    // Find which types need to be created
    const typesToCreate = PRODUCT_TYPES.filter(
      (type) => !existingValues.has(type.value)
    )

    if (typesToCreate.length === 0) {
      logger.info(
        `✓ All ${PRODUCT_TYPES.length} product types already exist`
      )
      return
    }

    logger.info(
      `Creating ${typesToCreate.length} missing product types: ${typesToCreate.map((t) => t.value).join(", ")}`
    )

    // Create missing product types
    await productModuleService.createProductTypes(typesToCreate)

    logger.info(
      `✓ Successfully created ${typesToCreate.length} product types`
    )
  } catch (error: any) {
    logger.error(
      "Error initializing product types:",
      error.message || error
    )
    // Don't throw - we want the backend to start even if this fails
  }
}
