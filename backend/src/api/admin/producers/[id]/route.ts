import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import ProducerService from "../../../../modules/producer/service"
import { PRODUCER_MODULE } from "../../../../modules/producer"

type RouteParams = {
  id: string
}

export async function GET(
  req: MedusaRequest<unknown, RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: producers } = await query.graph({
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
    filters: { id },
  })

  const producer = producers?.[0]

  if (!producer) {
    res.status(404).json({
      message: `Producer with ID ${id} not found`,
    })
    return
  }

  res.json({ producer })
}

export async function POST(
  req: MedusaRequest<{
    name?: string
    description?: string
    region?: string
    state?: string
    country_code?: string
    farm_size_acres?: number
    year_established?: number
    practices?: string[]
    certifications?: Array<{
      name: string
      issuer: string
      valid_until?: string
      document_url?: string
      verified?: boolean
    }>
    story?: string
    photo?: string
    cover_image?: string
    gallery?: string[]
    website?: string
    social_links?: {
      facebook?: string
      instagram?: string
      twitter?: string
      youtube?: string
    }
    public_profile_enabled?: boolean
    featured?: boolean
    verified?: boolean
    metadata?: Record<string, unknown>
  }, RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const producerModule = req.scope.resolve<ProducerService>(PRODUCER_MODULE)

  try {
    const updateData: Record<string, unknown> = {}
    
    // Only include fields that are provided
    const fields = [
      "name", "description", "region", "state", "country_code",
      "farm_size_acres", "year_established", "practices", "certifications",
      "story", "photo", "cover_image", "gallery", "website", "social_links",
      "public_profile_enabled", "featured", "verified", "metadata"
    ]
    
    for (const field of fields) {
      if (req.body[field as keyof typeof req.body] !== undefined) {
        updateData[field] = req.body[field as keyof typeof req.body]
      }
    }
    
    // If verified is being set to true, also set verified_at
    if (updateData.verified === true) {
      updateData.verified_at = new Date()
    } else if (updateData.verified === false) {
      updateData.verified_at = null
    }

    // Include id in the update data
    updateData.id = id

    const updatedProducer = await producerModule.updateProducers(updateData)

    res.json({ producer: updatedProducer })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update producer",
    })
  }
}

export async function DELETE(
  req: MedusaRequest<unknown, RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const producerModule = req.scope.resolve<ProducerService>(PRODUCER_MODULE)

  try {
    await producerModule.deleteProducers(id)
    res.json({ id, deleted: true })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to delete producer",
    })
  }
}
