import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Subscriber: Product Created → Link to Default Sales Channel
 *
 * When a product is created (by vendor or admin), automatically link it
 * to the store's default sales channel so it appears in the storefront.
 * Without this, products created outside the seed script are invisible
 * to the Store API because the publishable API key is scoped to a
 * specific sales channel.
 */
export default async function productCreatedSalesChannelHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id

  if (!productId) {
    return
  }

  try {
    const storeModuleService = container.resolve(Modules.STORE)
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Check if the product already has sales channels
    const { data: existingLinks } = await query.graph({
      entity: "product_sales_channel",
      fields: ["product_id", "sales_channel_id"],
      filters: { product_id: productId },
    })

    if (existingLinks && existingLinks.length > 0) {
      return
    }

    // Get the default sales channel from the store
    const [store] = await storeModuleService.listStores()
    const defaultSalesChannelId = store?.default_sales_channel_id

    if (!defaultSalesChannelId) {
      console.warn(
        `[productCreatedSalesChannel] No default sales channel configured for the store`
      )
      return
    }

    await link.create({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [Modules.SALES_CHANNEL]: {
        sales_channel_id: defaultSalesChannelId,
      },
    })
  } catch (error) {
    console.error(
      `[productCreatedSalesChannel] Failed to link product ${productId} to default sales channel:`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
}
