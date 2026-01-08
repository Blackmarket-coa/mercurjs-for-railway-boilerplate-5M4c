import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { createSellerMetadataWorkflow } from "../workflows/create-seller-metadata"
import { VendorType } from "../modules/seller-extension/models/seller-metadata"
import { SELLER_EXTENSION_MODULE } from "../modules/seller-extension"
import SellerExtensionService from "../modules/seller-extension/service"

/**
 * Subscriber: Seller Created
 *
 * Automatically creates seller_metadata when a new seller is created.
 * This ensures every seller has a vendor_type (defaults to PRODUCER).
 *
 * IMPORTANT: This subscriber checks if metadata already exists before creating.
 * This prevents race conditions when sellers are created via /vendor/sellers route
 * which creates metadata with the user's chosen vendor_type.
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

  console.log(`[sellerCreated subscriber] Processing seller ${sellerId}`)

  try {
    // Check if metadata already exists BEFORE trying to create
    // This prevents race condition with /vendor/sellers route
    const sellerExtensionService: SellerExtensionService = container.resolve(
      SELLER_EXTENSION_MODULE
    )

    const existingMetadata = await sellerExtensionService.listSellerMetadatas({
      seller_id: sellerId,
    })

    if (existingMetadata && existingMetadata.length > 0) {
      console.log(`[sellerCreated subscriber] Metadata already exists for seller ${sellerId}, skipping creation`)
      return
    }

    // No metadata exists, create with default values
    const { result } = await createSellerMetadataWorkflow.run({
      container,
      input: {
        seller_id: sellerId,
        vendor_type: VendorType.PRODUCER, // Default type
      },
    })

    console.log(`[sellerCreated subscriber] Seller metadata created: ${result.seller_metadata.id}`)
  } catch (error) {
    // Double-check for unique constraint errors (edge case)
    if (error instanceof Error && (
      error.message.includes("unique") ||
      error.message.includes("duplicate") ||
      error.message.includes("already exists")
    )) {
      console.log(`[sellerCreated subscriber] Metadata already exists for seller ${sellerId} (caught constraint error)`)
      return
    }

    console.error(`[sellerCreated subscriber] Failed to create seller metadata for ${sellerId}:`, error)
    throw error
  }
}

export const config: SubscriberConfig = {
  event: "sellerCreated",
}
