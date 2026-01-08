import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { createSellerMetadataWorkflow } from "../workflows/create-seller-metadata"
import { VendorType } from "../modules/seller-extension/models/seller-metadata"

/**
 * Subscriber: Seller Created
 *
 * Automatically creates seller_metadata when a new seller is created.
 * This ensures every seller has a vendor_type (defaults to PRODUCER).
 */
export default async function sellerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const sellerId = event.data.id

  if (!sellerId) {
    console.warn("sellerCreated event received without seller ID")
    return
  }

  console.log(`[sellerCreated subscriber] Creating metadata for seller ${sellerId}`)

  try {
    const { result } = await createSellerMetadataWorkflow.run({
      container,
      input: {
        seller_id: sellerId,
        vendor_type: VendorType.PRODUCER,
      },
    })

    console.log(`[sellerCreated subscriber] Seller metadata created: ${result.seller_metadata.id}`)
  } catch (error) {
    console.error(`[sellerCreated subscriber] Failed to create seller metadata for ${sellerId}:`, error)
    throw error
  }
}

export const config: SubscriberConfig = {
  event: "sellerCreated",
}
