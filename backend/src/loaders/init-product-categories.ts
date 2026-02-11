import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Standard product categories for the marketplace.
 * These are the community-aligned categories used across the platform.
 */
const PRODUCT_CATEGORIES = [
  "Fresh Produce",
  "Prepared Foods",
  "Pantry Staples",
  "Seeds & Starts",
  "Community Garden Plots",
  "Farm Tools",
  "Essentials",
  "Care Kits",
  "Repaired Goods",
  "Cooperative Access",
]

/**
 * This loader ensures that all standard product categories exist in the database.
 * It runs on backend startup and creates any missing categories.
 *
 * This is necessary because:
 * 1. The seed script may not have been run
 * 2. The seed script skips categories entirely if they already exist
 * 3. New categories may be added in updates
 * 4. Categories may have been accidentally deleted
 */
export default async function initProductCategories(
  container: MedusaContainer
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const productService = container.resolve(Modules.PRODUCT)

    // Get existing categories
    const existingCategories = await productService.listProductCategories(
      {},
      { select: ["id", "name"], take: null }
    )
    const existingNames = new Set(
      existingCategories.map((c: any) => c.name)
    )

    // Find which categories need to be created
    const categoriesToCreate = PRODUCT_CATEGORIES.filter(
      (name) => !existingNames.has(name)
    )

    if (categoriesToCreate.length === 0) {
      logger.info(
        `All ${PRODUCT_CATEGORIES.length} product categories already exist`
      )
      return
    }

    logger.info(
      `Creating ${categoriesToCreate.length} missing product categories: ${categoriesToCreate.join(", ")}`
    )

    // Create missing categories
    await productService.createProductCategories(
      categoriesToCreate.map((name) => ({
        name,
        is_active: true,
      }))
    )

    logger.info(
      `Successfully created ${categoriesToCreate.length} product categories`
    )
  } catch (error: any) {
    logger.error(
      "Error initializing product categories:",
      error.message || error
    )
    // Don't throw - we want the backend to start even if this fails
  }
}
