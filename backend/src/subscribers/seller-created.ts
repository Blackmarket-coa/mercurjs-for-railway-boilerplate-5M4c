import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { createSellerMetadataWorkflow } from "../workflows/create-seller-metadata"
import { VendorType } from "../modules/seller-extension/models/seller-metadata"

/**
 * Subscriber: Seller Created
 * 
 * Automatically creates seller_metadata when a new seller is created.
 * This ensures every seller has a vendor_type (defaults to RETAIL).
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

  console.log(`Creating seller metadata for seller ${sellerId}`)

  try {
    const { result } = await createSellerMetadataWorkflow.run({
      container,
      input: {
        seller_id: sellerId,
        vendor_type: VendorType.RETAIL, // Default type
      },
    })

    console.log(`Seller metadata created: ${result.seller_metadata.id}`)
  } catch (error) {
    // Check if metadata already exists (duplicate prevention)
    if (error instanceof Error && error.message.includes("unique")) {
      console.log(`Seller metadata already exists for seller ${sellerId}`)
      return
    }

    console.error(`Failed to create seller metadata for ${sellerId}:`, error)
    throw error
  }
}

export const config: SubscriberConfig = {
  event: "sellerCreated",
}
