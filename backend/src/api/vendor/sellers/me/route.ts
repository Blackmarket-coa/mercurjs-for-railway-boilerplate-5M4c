import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { requireSellerId } from "../../../../shared"

/**
 * GET /vendor/sellers/me
 *
 * Get the currently authenticated seller's profile information.
 * This endpoint is called by the vendor panel to fetch the logged-in seller's data.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  // Get seller ID from authentication context
  const sellerId = requireSellerId(req, res)
  if (!sellerId) return

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Parse fields from query params (comma-separated list)
    const requestedFields = req.query.fields as string | undefined

    // Default fields to return
    const defaultFields = [
      "id",
      "name",
      "description",
      "phone",
      "email",
      "handle",
      "photo",
      "address_line",
      "postal_code",
      "city",
      "region",
      "country_code",
      "tax_id",
      "store_status",
      "metadata",
      "created_at",
      "updated_at",
      // Include seller_metadata for vendor_type, certifications, etc.
      "seller_metadata.*",
      // Include producer if linked
      "producer.*",
    ]

    // If specific fields requested, parse them
    let fields = defaultFields
    if (requestedFields) {
      const parsedFields = requestedFields.split(",").map(f => f.trim()).filter(Boolean)
      if (parsedFields.length > 0) {
        // Map frontend field names to actual entity fields
        fields = parsedFields.map(f => {
          // Map common field names
          if (f === "media") return "photo" // media is alias for photo
          if (f === "website_url") return "seller_metadata.website_url"
          if (f === "social_links") return "seller_metadata.social_links"
          if (f === "storefront_links") return "seller_metadata.storefront_links"
          return f
        })
        // Always ensure id is included
        if (!fields.includes("id")) {
          fields.unshift("id")
        }
        // Add seller_metadata if metadata-related fields were requested
        const metadataFields = ["website_url", "social_links", "storefront_links", "vendor_type"]
        if (metadataFields.some(mf => requestedFields.includes(mf))) {
          fields.push("seller_metadata.*")
        }
      }
    }

    // Fetch seller data with related entities
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields,
      filters: { id: sellerId },
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
        type: "not_found",
      })
    }

    const seller = sellers[0] as Record<string, unknown>

    // Flatten seller_metadata into the response for easier frontend access
    const sellerMetadata = seller.seller_metadata as Record<string, unknown> | undefined
    const response: Record<string, unknown> = {
      ...seller,
      // Add metadata fields at top level for frontend compatibility
      vendor_type: sellerMetadata?.vendor_type,
      website_url: sellerMetadata?.website_url,
      social_links: sellerMetadata?.social_links,
      storefront_links: sellerMetadata?.storefront_links,
      // Map photo to media for frontend compatibility
      media: seller.photo,
    }

    return res.json({ seller: response })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[GET /vendor/sellers/me] Error:", errorMessage)
    return res.status(500).json({
      message: "Failed to fetch seller profile",
      type: "server_error",
    })
  }
}

/**
 * POST /vendor/sellers/me
 *
 * Update the currently authenticated seller's profile information.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  // Get seller ID from authentication context
  const sellerId = requireSellerId(req, res)
  if (!sellerId) return

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const body = req.body as Record<string, unknown>

    // Separate seller fields from seller_metadata fields
    const sellerFields = [
      "name", "description", "phone", "email", "handle", "photo",
      "address_line", "postal_code", "city", "region", "country_code", "tax_id", "metadata"
    ]
    const metadataFields = ["vendor_type", "website_url", "social_links", "storefront_links", "certifications"]

    const sellerUpdate: Record<string, unknown> = {}
    const metadataUpdate: Record<string, unknown> = {}

    // Sort fields into appropriate update objects
    for (const [key, value] of Object.entries(body)) {
      if (sellerFields.includes(key)) {
        sellerUpdate[key] = value
      } else if (metadataFields.includes(key)) {
        metadataUpdate[key] = value
      } else if (key === "media") {
        // Map media to photo
        sellerUpdate["photo"] = value
      }
    }

    // Get the seller module to update seller data
    // Note: In Medusa, we typically use workflows for updates, but for direct updates
    // we can use the module service
    const sellerModule = req.scope.resolve("seller")

    // Update seller if there are fields to update
    if (Object.keys(sellerUpdate).length > 0) {
      await sellerModule.updateSellers([
        { id: sellerId, ...sellerUpdate }
      ])
    }

    // Update seller_metadata if there are metadata fields to update
    if (Object.keys(metadataUpdate).length > 0) {
      // First, find the existing seller_metadata record
      const { data: metadataRecords } = await query.graph({
        entity: "seller_metadata",
        fields: ["id"],
        filters: { seller_id: sellerId },
      })

      const sellerExtensionModule = req.scope.resolve("sellerExtension")

      if (metadataRecords && metadataRecords.length > 0) {
        // Update existing metadata
        const metadataId = (metadataRecords[0] as { id: string }).id
        await sellerExtensionModule.updateSellerMetadatas([
          { id: metadataId, ...metadataUpdate }
        ])
      } else {
        // Create new metadata record
        await sellerExtensionModule.createSellerMetadatas([
          { seller_id: sellerId, ...metadataUpdate }
        ])
      }
    }

    // Fetch and return updated seller data
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: [
        "id", "name", "description", "phone", "email", "handle", "photo",
        "address_line", "postal_code", "city", "region", "country_code",
        "tax_id", "store_status", "metadata", "created_at", "updated_at",
        "seller_metadata.*",
      ],
      filters: { id: sellerId },
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        message: "Seller not found after update",
        type: "not_found",
      })
    }

    const seller = sellers[0] as Record<string, unknown>
    const sellerMetadata = seller.seller_metadata as Record<string, unknown> | undefined

    const response: Record<string, unknown> = {
      ...seller,
      vendor_type: sellerMetadata?.vendor_type,
      website_url: sellerMetadata?.website_url,
      social_links: sellerMetadata?.social_links,
      storefront_links: sellerMetadata?.storefront_links,
      media: seller.photo,
    }

    return res.json({ seller: response })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[POST /vendor/sellers/me] Error:", errorMessage)
    return res.status(500).json({
      message: "Failed to update seller profile",
      type: "server_error",
    })
  }
}
