import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface ProducerServiceType {
  createProducers: (data: Record<string, unknown>) => Promise<{ id: string }>
  updateProducers: (data: Record<string, unknown>) => Promise<{ id: string }>
}

/**
 * GET /vendor/farm/profile
 * Get the producer profile for the current seller
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  const sellerId = (req as unknown as { auth_context?: { actor_id: string } }).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    // Check if producer exists for this seller via producer_seller link
    const { data: producerLinks } = await query.graph({
      entity: "producer_seller",
      fields: ["producer.*"],
      filters: {
        seller_id: sellerId
      },
    })

    if (!producerLinks || producerLinks.length === 0) {
      // No producer profile yet
      return res.json({ producer: null })
    }

    const producer = producerLinks[0]?.producer

    res.json({ producer })
  } catch (error: any) {
    res.status(500).json({ 
      message: "Failed to fetch farm profile", 
      error: error.message 
    })
  }
}

/**
 * POST /vendor/farm/profile
 * Create a new producer profile for the current seller
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const producerService = req.scope.resolve("producer") as ProducerServiceType
  const linkService = req.scope.resolve("link") as unknown as { create: (data: Record<string, unknown>) => Promise<unknown[]> }
  const sellerId = (req as unknown as { auth_context?: { actor_id: string } }).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const {
      name,
      handle,
      description,
      region,
      state,
      country_code,
      farm_size_acres,
      year_established,
      practices,
      story,
      website,
      photo,
      cover_image,
    } = req.body as Record<string, any>

    // Create the producer
    const producer = await producerService.createProducers({
      name,
      handle,
      description,
      region,
      state,
      country_code,
      farm_size_acres,
      year_established,
      practices,
      story,
      website,
      photo,
      cover_image,
      public_profile_enabled: true,
    })

    // Link producer to seller
    await linkService.create({
      producer_seller: {
        producer_id: producer.id,
        seller_id: sellerId,
      }
    })

    res.status(201).json({ producer })
  } catch (error: any) {
    res.status(500).json({ 
      message: "Failed to create farm profile", 
      error: error.message 
    })
  }
}

/**
 * PUT /vendor/farm/profile
 * Update the producer profile for the current seller
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  const producerService = req.scope.resolve("producer") as ProducerServiceType
  const sellerId = (req as unknown as { auth_context?: { actor_id: string } }).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    // Get existing producer
    const { data: producerLinks } = await query.graph({
      entity: "producer_seller",
      fields: ["producer_id"],
      filters: {
        seller_id: sellerId
      },
    })

    if (!producerLinks || producerLinks.length === 0) {
      return res.status(404).json({ message: "Farm profile not found" })
    }

    const producerId = producerLinks[0].producer_id

    const {
      name,
      handle,
      description,
      region,
      state,
      country_code,
      farm_size_acres,
      year_established,
      practices,
      story,
      website,
      photo,
      cover_image,
      public_profile_enabled,
    } = req.body as Record<string, any>

    // Update the producer
    const producer = await producerService.updateProducers({
      id: producerId,
      name,
      handle,
      description,
      region,
      state,
      country_code,
      farm_size_acres,
      year_established,
      practices,
      story,
      website,
      photo,
      cover_image,
      public_profile_enabled,
    })

    res.json({ producer })
  } catch (error: any) {
    res.status(500).json({ 
      message: "Failed to update farm profile", 
      error: error.message 
    })
  }
}
