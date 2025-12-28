import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get all producers to calculate stats
  const { data: allProducers } = await query.graph({
    entity: "producer",
    fields: ["id", "verified", "featured", "public_profile_enabled"],
  })

  const total = allProducers?.length || 0
  const verified = allProducers?.filter((p: { verified: boolean }) => p.verified).length || 0
  const pending = allProducers?.filter((p: { verified: boolean }) => !p.verified).length || 0
  const featured = allProducers?.filter((p: { featured: boolean }) => p.featured).length || 0
  const public_count = allProducers?.filter((p: { public_profile_enabled: boolean }) => p.public_profile_enabled).length || 0

  res.json({
    stats: {
      total,
      verified,
      pending,
      featured,
      public: public_count,
    }
  })
}
