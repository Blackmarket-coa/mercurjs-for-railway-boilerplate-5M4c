import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createSellerWorkflow } from "@mercurjs/b2c-core/workflows"
import { createSellerMetadataWorkflow } from "../../../workflows/create-seller-metadata"
import { VendorType } from "../../../modules/seller-extension/models/seller-metadata"
import { SELLER_EXTENSION_MODULE } from "../../../modules/seller-extension"
import SellerExtensionService from "../../../modules/seller-extension/service"
import { createSellerSchema, CreateSellerInput } from "./validators"

// Disable automatic authentication to allow public registration
export const AUTHENTICATE = false

/**
 * POST /vendor/sellers
 *
 * Create a new seller during vendor registration.
 * This endpoint is called after the auth registration to create the seller entity
 * and associated metadata including vendor_type.
 *
 * NOTE: Handles race condition with seller-created subscriber by using upsert logic.
 * If the subscriber creates metadata first (with default PRODUCER type), this route
 * will update it with the user's actual vendor_type selection.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Manually validate request body using Zod schema
  let body: CreateSellerInput
  try {
    body = createSellerSchema.parse(req.body)
  } catch (validationError: any) {
    console.error("[POST /vendor/sellers] Validation error:", validationError)
    return res.status(400).json({
      type: "invalid_data",
      message: validationError.errors?.[0]?.message || "Invalid request data",
      errors: validationError.errors,
    })
  }

  console.log("[POST /vendor/sellers] Validated body:", {
    name: body.name,
    vendor_type: body.vendor_type,
    hasWebsiteUrl: !!body.website_url,
    hasSocialLinks: !!body.social_links,
  });

  try {
    // Create the seller using MercurJS workflow
    const { result: seller } = await createSellerWorkflow.run({
      container: req.scope,
      input: {
        member: {
          name: body.member.name,
          email: body.member.email,
        },
        seller: {
          name: body.name,
        },
      },
    })

    // Get seller extension service for upsert logic
    const sellerExtensionService: SellerExtensionService = req.scope.resolve(
      SELLER_EXTENSION_MODULE
    )

    // Check if metadata was already created by the subscriber (race condition)
    const existingMetadata = await sellerExtensionService.listSellerMetadatas({
      seller_id: seller.id,
    })

    const metadataInput = {
      vendor_type: body.vendor_type || VendorType.PRODUCER,
      website_url: body.website_url || null,
      social_links: body.social_links || null,
    }

    if (existingMetadata && existingMetadata.length > 0) {
      // Metadata already exists (created by subscriber) - update it with user's values
      console.log(`[POST /vendor/sellers] Updating existing metadata for seller ${seller.id}`)
      await sellerExtensionService.updateSellerMetadatas({
        id: existingMetadata[0].id,
        ...metadataInput,
      })
    } else {
      // No metadata exists - create it
      console.log(`[POST /vendor/sellers] Creating metadata for seller ${seller.id}`)
      await createSellerMetadataWorkflow.run({
        container: req.scope,
        input: {
          seller_id: seller.id,
          ...metadataInput,
        } as any,
      })
    }

    return res.status(201).json({
      seller: {
        id: seller.id,
        name: seller.name,
        members: seller.members,
      },
    })
  } catch (error: any) {
    console.error("Failed to create seller:", error)

    // Return proper error response
    return res.status(400).json({
      type: "invalid_data",
      message: error.message || "Failed to create seller",
    })
  }
}
