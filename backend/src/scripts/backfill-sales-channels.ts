/**
 * Backfill: Link all products to the default sales channel
 *
 * Products created outside the seed script may not have been linked to
 * any sales channel, making them invisible to the storefront (the Store
 * API scopes results by the publishable API key's sales channel).
 *
 * This script finds every product without a sales channel and links it
 * to the store's default sales channel.
 *
 * Usage: npx medusa exec src/scripts/backfill-sales-channels.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function backfillSalesChannels({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModuleService = container.resolve(Modules.STORE)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("[backfill-sales-channels] Starting...")

  // Get the default sales channel
  const [store] = await storeModuleService.listStores()
  const defaultSalesChannelId = store?.default_sales_channel_id

  if (!defaultSalesChannelId) {
    logger.error(
      "[backfill-sales-channels] No default sales channel configured. Aborting."
    )
    return
  }

  logger.info(
    `[backfill-sales-channels] Default sales channel: ${defaultSalesChannelId}`
  )

  // Fetch all products
  const products = await productModuleService.listProducts(
    {},
    { select: ["id", "title"], take: 1000 }
  )

  logger.info(
    `[backfill-sales-channels] Found ${products.length} total products`
  )

  let linked = 0
  let skipped = 0

  for (const product of products) {
    try {
      // Check if this product already has a sales channel link
      const { data: existingLinks } = await query.graph({
        entity: "product_sales_channel",
        fields: ["product_id", "sales_channel_id"],
        filters: { product_id: product.id },
      })

      if (existingLinks && existingLinks.length > 0) {
        skipped++
        continue
      }

      // Link the product to the default sales channel
      await link.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [Modules.SALES_CHANNEL]: {
          sales_channel_id: defaultSalesChannelId,
        },
      })

      linked++
      logger.info(
        `[backfill-sales-channels] Linked "${product.title}" (${product.id})`
      )
    } catch (error) {
      logger.error(
        `[backfill-sales-channels] Failed to link product ${product.id}: ${error}`
      )
    }
  }

  logger.info(
    `[backfill-sales-channels] Done. Linked: ${linked}, Already linked: ${skipped}`
  )
}
