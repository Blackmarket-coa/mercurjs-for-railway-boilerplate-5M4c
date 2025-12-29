import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HARVEST_MODULE } from "../../../../modules/harvest"

/**
 * GET /store/harvests/:id/claims
 * 
 * Get claims for a harvest
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: claims } = await query.graph({
    entity: "harvest_claim",
    fields: [
      "id",
      "allocation_id",
      "customer_id",
      "membership_id",
      "quantity_claimed",
      "value_claimed",
      "status",
      "claimed_at",
      "collected_at",
    ],
    filters: {
      harvest_id: id,
    },
  })

  res.json({ claims })
}

/**
 * POST /store/harvests/:id/claims
 * 
 * Claim a share of a harvest
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const harvestService = req.scope.resolve(HARVEST_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    allocation_id,
    customer_id,
    membership_id,
    quantity_requested,
  } = req.body as any

  // Get the allocation
  const { data: [allocation] } = await query.graph({
    entity: "harvest_allocation",
    fields: ["id", "remaining_quantity", "allocated_value", "allocated_quantity", "status"],
    filters: { id: allocation_id },
  })

  if (!allocation) {
    res.status(404).json({ message: "Allocation not found" })
    return
  }

  if (allocation.status !== "open") {
    res.status(400).json({ message: "Allocation is not open for claims" })
    return
  }

  const quantity_claimed = Math.min(quantity_requested, allocation.remaining_quantity)
  const value_claimed = (quantity_claimed / allocation.allocated_quantity) * allocation.allocated_value

  const claim = await harvestService.createHarvestClaims({
    harvest_id: id,
    allocation_id,
    customer_id,
    membership_id,
    quantity_claimed,
    value_claimed,
    status: "pending",
    claimed_at: new Date(),
  })

  // Update allocation remaining quantity
  await harvestService.updateHarvestAllocations({
    id: allocation_id,
    remaining_quantity: allocation.remaining_quantity - quantity_claimed,
    claimed_quantity: (allocation.allocated_quantity - allocation.remaining_quantity) + quantity_claimed,
  })

  res.status(201).json({ claim })
}
