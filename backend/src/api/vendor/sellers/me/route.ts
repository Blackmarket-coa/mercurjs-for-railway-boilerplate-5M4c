import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { requireSellerId } from "../../../../shared"
import {
  createSellerMetadataRecord,
  updateSellerMetadataRecord,
} from "../../../../modules/seller-extension/metadata-service"

const DEFAULT_METADATA_FIELDS = [
  "vendor_type",
  "website_url",
  "social_links",
  "storefront_links",
  "certifications",
]

const METADATA_FIELD_SET = new Set(DEFAULT_METADATA_FIELDS)

const normalizeRequestedFields = (
  requestedFields: unknown
): string | string[] | undefined => {
  if (typeof requestedFields === "string") {
    return requestedFields
  }

  if (Array.isArray(requestedFields) && requestedFields.every(item => typeof item === "string")) {
    return requestedFields
  }

  return undefined
}

const parseRequestedFields = (
  requestedFields: unknown,
  defaultSellerFields: string[]
) => {
  const normalizedFields = normalizeRequestedFields(requestedFields)
  const requested =
    typeof normalizedFields === "string" ? normalizedFields : normalizedFields?.join(",")

  if (!requested) {
    return {
      sellerFields: [...defaultSellerFields],
      metadataFields: [...DEFAULT_METADATA_FIELDS],
      includeMediaAlias: true,
    }
  }

  const parsedFields = requested.split(",").map(field => field.trim()).filter(Boolean)
  const metadataFields = parsedFields.filter(field => METADATA_FIELD_SET.has(field))
  const sellerFields = parsedFields
    .filter(field => !METADATA_FIELD_SET.has(field))
    .map(field => (field === "media" ? "photo" : field))

  if (!sellerFields.includes("id")) {
    sellerFields.unshift("id")
  }

  return {
    sellerFields,
    metadataFields,
    includeMediaAlias: parsedFields.includes("media"),
  }
}

/**
 * GET /vendor/sellers/me
 *
 * Get the currently authenticated seller's profile information.
 * This endpoint is called by the vendor panel to fetch the logged-in seller's data.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  // Get seller ID from authentication context
  const sellerId = await requireSellerId(req, res)
  if (!sellerId) return

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Default seller fields to return
    const defaultSellerFields = [
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
      "country_code",
      "tax_id",
      "store_status",
      "metadata",
      "created_at",
      "updated_at",
      // Include producer if linked
      "producer.*",
    ]
    const { sellerFields, metadataFields, includeMediaAlias } = parseRequestedFields(
      req.query.fields,
      defaultSellerFields
    )

    // Fetch seller data with related entities
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: sellerFields,
      filters: { id: sellerId },
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
        type: "not_found",
      })
    }

    const seller = sellers[0] as Record<string, unknown>

    const response: Record<string, unknown> = {
      ...seller,
    }

    if (metadataFields.length > 0) {
      const { data: metadataRecords } = await query.graph({
        entity: "seller_metadata",
        fields: metadataFields,
        filters: { seller_id: sellerId },
      })
      const sellerMetadata = (metadataRecords?.[0] ?? {}) as Record<string, unknown>
      for (const field of metadataFields) {
        response[field] = sellerMetadata[field]
      }
    }

    if (includeMediaAlias) {
      response.media = seller.photo
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
  const sellerId = await requireSellerId(req, res)
  if (!sellerId) return

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const body = req.body as Record<string, unknown>

    // Separate seller fields from seller_metadata fields
    const sellerUpdateFields = [
      "name", "description", "phone", "email", "handle", "photo",
      "address_line", "postal_code", "city", "country_code", "tax_id", "metadata"
    ]
    const metadataUpdateFields = ["vendor_type", "website_url", "social_links", "storefront_links", "certifications"]

    const sellerUpdate: Record<string, unknown> = {}
    const metadataUpdate: Record<string, unknown> = {}

    // Sort fields into appropriate update objects
    for (const [key, value] of Object.entries(body)) {
      if (sellerUpdateFields.includes(key)) {
        sellerUpdate[key] = value
      } else if (metadataUpdateFields.includes(key)) {
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
        await updateSellerMetadataRecord(sellerExtensionModule, [
          { id: metadataId, ...metadataUpdate },
        ])
      } else {
        // Create new metadata record
        await createSellerMetadataRecord(sellerExtensionModule, [
          { seller_id: sellerId, ...metadataUpdate },
        ])
      }
    }

    const defaultSellerFields = [
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
      "country_code",
      "tax_id",
      "store_status",
      "metadata",
      "created_at",
      "updated_at",
    ]

    const { sellerFields, metadataFields, includeMediaAlias } = parseRequestedFields(
      req.query.fields,
      defaultSellerFields
    )

    // Fetch and return updated seller data
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: sellerFields,
      filters: { id: sellerId },
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        message: "Seller not found after update",
        type: "not_found",
      })
    }

    const seller = sellers[0] as Record<string, unknown>
    const response: Record<string, unknown> = { ...seller }

    if (metadataFields.length > 0) {
      const { data: metadataRecords } = await query.graph({
        entity: "seller_metadata",
        fields: metadataFields,
        filters: { seller_id: sellerId },
      })
      const sellerMetadata = (metadataRecords?.[0] ?? {}) as Record<string, unknown>
      for (const field of metadataFields) {
        response[field] = sellerMetadata[field]
      }
    }

    if (includeMediaAlias) {
      response.media = seller.photo
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
