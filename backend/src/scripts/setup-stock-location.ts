import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

async function setupStockLocation(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info("Setting up default stock location...")

    // Get the stock location module service
    const stockLocationService = container.resolve(Modules.STOCK_LOCATION)

    // Get the store module service
    const storeService = container.resolve(Modules.STORE)

    // Get all stores
    const stores = await storeService.listStores()

    if (!stores || stores.length === 0) {
      logger.error("No store found!")
      return
    }

    const store = stores[0]
    logger.info(`Found store: ${store.id} (${store.name})`)

    // Check if store already has a default location
    if (store.default_location_id) {
      logger.info(`Store already has default location: ${store.default_location_id}`)
      return
    }

    // List existing stock locations
    const existingLocations = await stockLocationService.listStockLocations()

    if (existingLocations && existingLocations.length > 0) {
      const location = existingLocations[0]
      logger.info(`Using existing stock location: ${location.id} (${location.name})`)

      // Update store to use this location
      await storeService.updateStores(store.id, {
        default_location_id: location.id,
      })

      logger.info(`✓ Store updated with default location: ${location.id}`)
      return
    }

    // Create a new stock location
    logger.info("Creating new stock location...")

    const newLocation = await stockLocationService.createStockLocations({
      name: "Main Warehouse",
      address: {
        address_1: "123 Warehouse Street",
        city: "New York",
        country_code: "US",
        postal_code: "10001",
      },
    })

    logger.info(`✓ Created stock location: ${newLocation[0].id}`)

    // Update store to use this location
    await storeService.updateStores(store.id, {
      default_location_id: newLocation[0].id,
    })

    logger.info(`✓ Store updated with default location: ${newLocation[0].id}`)
    logger.info("✓ Stock location setup complete!")
  } catch (error: any) {
    logger.error("Error setting up stock location:", error)
    throw error
  }

export default setupStockLocation
