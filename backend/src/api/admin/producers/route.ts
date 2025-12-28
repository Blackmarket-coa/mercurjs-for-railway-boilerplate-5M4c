import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Build filters from query params
  const filters: Record<string, unknown> = {}
  
  if (req.query.verified !== undefined) {
    filters.verified = req.query.verified === "true"
  }
  
  if (req.query.featured !== undefined) {
    filters.featured = req.query.featured === "true"
  }
  
  if (req.query.q) {
    // Search by name
    filters.name = { $ilike: `%${req.query.q}%` }
  }

  const {
    data: producers,
    metadata
  } = await query.graph({
    entity: "producer",
    fields: [
      "id",
      "seller_id",
      "name",
      "handle",
      "description",
      "region",
      "state",
      "country_code",
      "latitude",
      "longitude",
      "farm_size_acres",
      "year_established",
      "practices",
      "certifications",
      "story",
      "photo",
      "cover_image",
      "gallery",
      "website",
      "social_links",
      "public_profile_enabled",
      "featured",
      "verified",
      "verified_at",
      "metadata",
      "created_at",
      "updated_at",
    ],
    filters,
    pagination: {
      skip: req.query.offset ? Number(req.query.offset) : 0,
      take: req.query.limit ? Number(req.query.limit) : 20,
    },
  })

  res.json({
    producers,
    count: metadata?.count || 0,
    limit: metadata?.take || 20,
    offset: metadata?.skip || 0,
  })
}
