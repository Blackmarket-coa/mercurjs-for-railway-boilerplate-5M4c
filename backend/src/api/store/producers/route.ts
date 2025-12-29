import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/producers
 * List all public producers/farms
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  
  const { limit = 20, offset = 0, featured, region, search } = req.query as Record<string, any>

  try {
    const filters: Record<string, any> = {
      public_profile_enabled: true,
    }
    
    if (featured === 'true') {
      filters.featured = true
    }
    
    if (region) {
      filters.region = region
    }

    // Get public producers
    const { data: producers } = await query.graph({
      entity: "producer",
      fields: [
        "id",
        "name",
        "handle",
        "description",
        "region",
        "state",
        "country_code",
        "farm_size_acres",
        "year_established",
        "practices",
        "certifications",
        "story",
        "photo",
        "cover_image",
        "featured",
        "verified",
        "created_at",
      ],
      filters,
      pagination: {
        skip: parseInt(offset as string, 10),
        take: parseInt(limit as string, 10),
        order: { featured: "DESC", name: "ASC" }
      }
    })

    // If search, filter by name (basic search)
    let filteredProducers = producers || []
    if (search) {
      const searchLower = (search as string).toLowerCase()
      filteredProducers = filteredProducers.filter((p: any) => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.region?.toLowerCase().includes(searchLower)
      )
    }

    res.json({
      producers: filteredProducers,
      count: filteredProducers.length,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch producers",
      error: error.message,
    })
  }
}
