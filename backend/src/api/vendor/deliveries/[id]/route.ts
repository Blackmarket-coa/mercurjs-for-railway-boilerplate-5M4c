import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FOOD_DISTRIBUTION_MODULE } from "../../../../modules/food-distribution"
import type FoodDistributionService from "../../../../modules/food-distribution/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { requireSellerId, notFound, forbidden, validationError, type StatusHistoryEntry } from "../../../../shared"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const updateDeliveryStatusSchema = z.object({
  status: z.enum([
    "ASSIGNED",
    "WAITING_FOR_ORDER",
    "ORDER_PICKED_UP",
    "CANCELLED",
  ]),
  note: z.string().max(500).optional(),
})

// ===========================================
// GET /vendor/deliveries/:id
// Get a single delivery detail
// ===========================================

export async function GET(
  req: AuthenticatedMedusaRequest<never, { id: string }>,
  res: MedusaResponse
) {
  try {
    const sellerId = requireSellerId(req, res)
    if (!sellerId) return

    const { id } = req.params
    const queryService = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Get producer linked to this seller
    const { data: sellerData } = await queryService.graph({
      entity: "seller",
      filters: { id: sellerId },
      fields: ["id", "producer.*"],
    })

    if (!sellerData.length || !sellerData[0].producer) {
      res.status(404).json({ message: "No producer profile linked to this seller" })
      return
    }

    const producerId = sellerData[0].producer.id

    // Get the delivery
    const delivery = await foodDistribution.retrieveFoodDelivery(id, {
      relations: ["courier"],
    })

    if (!delivery) {
      res.status(404).json({ message: "Delivery not found" })
      return
    }

    // Verify this delivery belongs to the vendor's producer
    if (delivery.producer_id !== producerId) {
      res.status(403).json({ message: "This delivery does not belong to your store" })
      return
    }

    res.json({ delivery })
  } catch (error) {
    throw error
  }
}

// ===========================================
// POST /vendor/deliveries/:id
// Update delivery status (vendor actions)
// ===========================================

export async function POST(
  req: AuthenticatedMedusaRequest<{ status: string; note?: string }, { id: string }>,
  res: MedusaResponse
) {
  try {
    const sellerId = requireSellerId(req, res)
    if (!sellerId) return

    const { id } = req.params
    const data = updateDeliveryStatusSchema.parse(req.body)
    
    const queryService = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const foodDistribution = req.scope.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Get producer linked to this seller
    const { data: sellerData } = await queryService.graph({
      entity: "seller",
      filters: { id: sellerId },
      fields: ["id", "producer.*"],
    })

    if (!sellerData.length || !sellerData[0].producer) {
      res.status(404).json({ message: "No producer profile linked to this seller" })
      return
    }

    const producerId = sellerData[0].producer.id

    // Get the delivery
    const delivery = await foodDistribution.retrieveFoodDelivery(id)

    if (!delivery) {
      res.status(404).json({ message: "Delivery not found" })
      return
    }

    // Verify this delivery belongs to the vendor's producer
    if (delivery.producer_id !== producerId) {
      res.status(403).json({ message: "This delivery does not belong to your store" })
      return
    }

    // Update status history
    const existingHistory = (delivery.status_history || []) as StatusHistoryEntry[]
    const statusHistory: StatusHistoryEntry[] = [
      ...existingHistory,
      {
        status: data.status,
        timestamp: new Date().toISOString(),
        note: data.note,
        actor: "vendor",
      }
    ]

    // Update the delivery
    const updatedDelivery = await foodDistribution.updateFoodDeliveries({
      selector: { id },
      data: {
        status: data.status as any,
        status_history: statusHistory as any,
      },
    })

    res.json({ delivery: updatedDelivery })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}
