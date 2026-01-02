import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FOOD_DISTRIBUTION_MODULE } from "../../../../modules/food-distribution"
import type FoodDistributionService from "../../../../modules/food-distribution/service"
import { requireSellerId, notFound, validationError } from "../../../../shared"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const updateZoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  
  // GeoJSON polygon boundary
  boundary: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }).optional(),
  
  // Center point
  center_latitude: z.number().min(-90).max(90).optional(),
  center_longitude: z.number().min(-180).max(180).optional(),
  
  // Pricing
  base_delivery_fee: z.number().min(0).optional(),
  per_mile_fee: z.number().min(0).optional(),
  minimum_order: z.number().min(0).nullable().optional(),
  
  // Service hours (per day)
  service_hours: z.record(z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
  })).nullable().optional(),
  
  // Status
  active: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
})

// ===========================================
// GET /vendor/delivery-zones/:id
// Get a single delivery zone
// ===========================================

export async function GET(
  req: AuthenticatedMedusaRequest<never, { id: string }>,
  res: MedusaResponse
) {
  try {
    const sellerId = requireSellerId(req, res)
    if (!sellerId) return

    const { id } = req.params
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    const zone = await foodDistribution.retrieveDeliveryZone(id)

    if (!zone) {
      res.status(404).json({ message: "Delivery zone not found" })
      return
    }

    res.json({ zone })
  } catch (error) {
    throw error
  }
}

// ===========================================
// POST /vendor/delivery-zones/:id
// Update a delivery zone
// ===========================================

export async function POST(
  req: AuthenticatedMedusaRequest<Record<string, any>, { id: string }>,
  res: MedusaResponse
) {
  try {
    const sellerId = requireSellerId(req, res)
    if (!sellerId) return

    const { id } = req.params
    const data = updateZoneSchema.parse(req.body)
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Verify zone exists
    const existing = await foodDistribution.retrieveDeliveryZone(id)
    if (!existing) {
      res.status(404).json({ message: "Delivery zone not found" })
      return
    }

    // Prepare update data (convert dollars to cents)
    const updateData: Record<string, any> = { id }
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.boundary !== undefined) updateData.boundary = data.boundary
    if (data.center_latitude !== undefined) updateData.center_latitude = data.center_latitude
    if (data.center_longitude !== undefined) updateData.center_longitude = data.center_longitude
    if (data.base_delivery_fee !== undefined) updateData.base_delivery_fee = Math.round(data.base_delivery_fee * 100)
    if (data.per_mile_fee !== undefined) updateData.per_mile_fee = Math.round(data.per_mile_fee * 100)
    if (data.minimum_order !== undefined) updateData.minimum_order = data.minimum_order ? Math.round(data.minimum_order * 100) : null
    if (data.service_hours !== undefined) updateData.service_hours = data.service_hours
    if (data.active !== undefined) updateData.active = data.active
    if (data.priority !== undefined) updateData.priority = data.priority

    const zone = await foodDistribution.updateDeliveryZones(updateData)

    res.json({ zone })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}

// ===========================================
// DELETE /vendor/delivery-zones/:id
// Delete a delivery zone
// ===========================================

export async function DELETE(
  req: AuthenticatedMedusaRequest<never, { id: string }>,
  res: MedusaResponse
) {
  try {
    const sellerId = requireSellerId(req, res)
    if (!sellerId) return

    const { id } = req.params
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Verify zone exists
    const existing = await foodDistribution.retrieveDeliveryZone(id)
    if (!existing) {
      res.status(404).json({ message: "Delivery zone not found" })
      return
    }

    await foodDistribution.deleteDeliveryZones(id)

    res.status(204).send()
  } catch (error) {
    throw error
  }
}
