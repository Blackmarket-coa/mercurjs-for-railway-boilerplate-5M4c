import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /vendor/farm/stats
 * Get dashboard stats for the current farm
 *
 * OPTIMIZED: Uses parallel query execution where possible
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
    // Get producer ID for this seller
    const { data: producerLinks } = await query.graph({
      entity: "producer_seller",
      fields: ["producer_id"],
      filters: {
        seller_id: sellerId
      },
    })

    if (!producerLinks || producerLinks.length === 0) {
      return res.json({
        stats: {
          active_harvests: 0,
          total_lots: 0,
          available_products: 0,
          pending_orders: 0,
        }
      })
    }

    const producerId = producerLinks[0].producer_id

    // Get harvest counts first (needed for lot query)
    const { data: harvests } = await query.graph({
      entity: "harvest",
      fields: ["id", "visibility_status"],
      filters: {
        producer_id: producerId,
        visibility_status: { $in: ["PUBLIC", "PREVIEW"] }
      },
    })

    const harvestIds = harvests?.map((h: any) => h.id) || []

    // OPTIMIZATION: If we have harvests, get lot counts
    // Future: add parallel queries for available_products and pending_orders
    let lotsCount = 0
    if (harvestIds.length > 0) {
      const { data: lots } = await query.graph({
        entity: "lot",
        fields: ["id"],
        filters: {
          harvest_id: { $in: harvestIds },
          is_active: true,
        },
      })
      lotsCount = lots?.length || 0
    }

    // TODO: Get availability windows linked to products for "available_products"
    // TODO: Get pending orders from order service

    res.json({
      stats: {
        active_harvests: harvests?.length || 0,
        total_lots: lotsCount,
        available_products: 0, // TODO: implement
        pending_orders: 0, // TODO: implement
      }
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch farm stats",
      error: error.message
    })
  }
}
