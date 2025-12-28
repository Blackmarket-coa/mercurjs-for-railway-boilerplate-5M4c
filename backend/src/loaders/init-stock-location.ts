import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * This loader ensures that every store has a default stock location configured.
 * It runs on backend startup and creates a stock location if needed.
 */
export default async function initStockLocation(
  container: MedusaContainer
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const storeService = container.resolve(Modules.STORE)
    const stockLocationService = container.resolve(Modules.STOCK_LOCATION)

    // Get all stores
    const stores = await storeService.listStores()

    if (!stores || stores.length === 0) {
      logger.info("No stores found. Skipping stock location initialization.")
      return
    }

    for (const store of stores) {
      // Check if store already has a default location
      if (store.default_location_id) {
        logger.info(
          `Store ${store.id} already has default location: ${store.default_location_id}`
        )
        continue
      }

      logger.info(`Store ${store.id} needs a default stock location`)

      // Try to find an existing stock location
      const existingLocations = await stockLocationService.listStockLocations({})

      let locationId: string

      if (existingLocations && existingLocations.length > 0) {
        // Use the first existing location
        locationId = existingLocations[0].id
        logger.info(
          `Using existing stock location for store ${store.id}: ${locationId}`
        )
      } else {
        // Create a new stock location
        logger.info(
          `Creating new default stock location for store ${store.id}...`
        )

        const newLocation = await stockLocationService.createStockLocations({
          name: "Default Warehouse",
          address: {
            address_1: "123 Warehouse Street",
            city: "Default City",
            country_code: "US",
            postal_code: "10001",
          },
        })

        locationId = newLocation[0].id
        logger.info(
          `Created new stock location for store ${store.id}: ${locationId}`
        )
      }

      // Update store with the default location
      await storeService.updateStores(store.id, {
        default_location_id: locationId,
      })

      logger.info(
        `✓ Store ${store.id} now has default location: ${locationId}`
      )
    }

    logger.info("✓ Stock location initialization complete!")
  } catch (error: any) {
    logger.error(
      "Error initializing stock locations:",
      error.message || error
    )
    // Don't throw - we want the backend to start even if this fails
    // But log the error so users know what went wrong
  }
}
