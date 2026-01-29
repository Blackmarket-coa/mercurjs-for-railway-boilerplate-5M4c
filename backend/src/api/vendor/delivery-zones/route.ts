import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { FOOD_DISTRIBUTION_MODULE } from "../../../modules/food-distribution"
import type FoodDistributionService from "../../../modules/food-distribution/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { requireSellerId, validationError } from "../../../shared"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const createZoneSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9-]+$/),
  
  // GeoJSON polygon boundary
  boundary: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  
  // Center point
  center_latitude: z.number().min(-90).max(90),
  center_longitude: z.number().min(-180).max(180),
  
  // Radius in miles (for simple circular zones)
  radius_miles: z.number().min(0).max(100).optional(),
  
  // Pricing
  base_delivery_fee: z.number().min(0).default(0),
  per_mile_fee: z.number().min(0).default(0),
  minimum_order: z.number().min(0).optional(),
  
  // Service hours (per day)
  service_hours: z.record(z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional(),
  
  // Status
  active: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
})

const updateZoneSchema = createZoneSchema.partial()

const listZonesQuerySchema = z.object({
  active: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

// ===========================================
// GET /vendor/delivery-zones
// List all delivery zones for the vendor
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const sellerId = await requireSellerId(req, res)
    if (!sellerId) return

    const query = listZonesQuerySchema.parse(req.query)
    const queryService = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Get producer linked to this seller
    const { data: sellerData } = await queryService.graph({
      entity: "seller",
      filters: { id: sellerId },
      fields: ["id", "producer.*"],
    }) as { data: Array<{ id: string; producer?: { id: string } | null }> }

    if (!sellerData.length || !sellerData[0].producer) {
      res.status(404).json({ message: "No producer profile linked to this seller" })
      return
    }

    const producerId = sellerData[0].producer.id

    // Get zones linked to this producer
    // Note: In a full implementation, you'd have a producer_id on DeliveryZone
    // For now, we'll get all active zones (they can be linked to producers later)
    const filters: Record<string, any> = {}
    if (query.active !== undefined) filters.active = query.active

    const zones = await foodDistribution.listDeliveryZones(filters, {
      take: query.limit,
      skip: query.offset,
      order: { priority: "DESC", name: "ASC" },
    })

    const count = await foodDistribution
      .listDeliveryZones(filters, { select: ["id"] })
      .then((z) => z.length)

    res.json({
      zones,
      count,
      limit: query.limit,
      offset: query.offset,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}

// ===========================================
// POST /vendor/delivery-zones
// Create a new delivery zone
// ===========================================

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const sellerId = await requireSellerId(req, res)
    if (!sellerId) return

    const data = createZoneSchema.parse(req.body)
    const queryService = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Get producer linked to this seller
    const { data: sellerData } = await queryService.graph({
      entity: "seller",
      filters: { id: sellerId },
      fields: ["id", "producer.*"],
    }) as { data: Array<{ id: string; producer?: { id: string } | null }> }

    if (!sellerData.length || !sellerData[0].producer) {
      res.status(404).json({ message: "No producer profile linked to this seller" })
      return
    }

    // Check for duplicate code
    const existing = await foodDistribution.listDeliveryZones({ code: data.code })
    if (existing.length > 0) {
      res.status(400).json({ message: "A zone with this code already exists" })
      return
    }

    // Create the zone
    const zone = await foodDistribution.createDeliveryZones({
      ...data,
      // Convert dollars to cents for storage
      base_delivery_fee: Math.round(data.base_delivery_fee * 100),
      per_mile_fee: Math.round(data.per_mile_fee * 100),
      minimum_order: data.minimum_order ? Math.round(data.minimum_order * 100) : undefined,
    })

    res.status(201).json({ zone })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}
