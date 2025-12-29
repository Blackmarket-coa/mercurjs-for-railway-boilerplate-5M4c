import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GARDEN_MODULE } from "../../../modules/garden"

/**
 * GET /store/gardens
 * 
 * List all public community gardens
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: gardens, metadata } = await query.graph({
    entity: "garden",
    fields: [
      "id",
      "name",
      "slug",
      "description",
      "location.*",
      "size_sqft",
      "total_plots",
      "available_plots",
      "growing_zones",
      "membership_types",
      "governance_model",
      "amenities",
      "contact_email",
      "operating_hours",
      "image_urls",
      "status",
    ],
    filters: {
      status: "active",
      is_public: true,
    },
    pagination: {
      skip: parseInt(req.query.offset as string) || 0,
      take: parseInt(req.query.limit as string) || 20,
    },
  })

  res.json({
    gardens,
    count: metadata?.count || gardens.length,
    offset: parseInt(req.query.offset as string) || 0,
    limit: parseInt(req.query.limit as string) || 20,
  })
}

/**
 * POST /store/gardens
 * 
 * Create a new community garden
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const gardenService = req.scope.resolve(GARDEN_MODULE)
  
  const {
    name,
    description,
    location,
    size_sqft,
    growing_zones,
    membership_types,
    governance_model,
    amenities,
    contact_email,
    operating_hours,
    image_urls,
  } = req.body as any

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const garden = await gardenService.createGardens({
    name,
    slug,
    description,
    location,
    size_sqft,
    growing_zones,
    membership_types: membership_types || ["plot_holder", "volunteer", "investor"],
    governance_model: governance_model || "hybrid",
    amenities,
    contact_email,
    operating_hours,
    image_urls,
    status: "planning",
    is_public: false,
    total_plots: 0,
    available_plots: 0,
  })

  res.status(201).json({ garden })
}
