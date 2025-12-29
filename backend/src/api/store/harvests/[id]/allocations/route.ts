import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HARVEST_MODULE } from "../../../../modules/harvest"
import { HarvestAllocationEngine } from "../../../../modules/harvest/services/allocation-engine"

/**
 * GET /store/harvests/:id/allocations
 * 
 * Get allocations for a harvest
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: allocations } = await query.graph({
    entity: "harvest_allocation",
    fields: [
      "id",
      "pool_type",
      "percentage",
      "allocated_quantity",
      "allocated_value",
      "claimed_quantity",
      "remaining_quantity",
      "status",
    ],
    filters: {
      harvest_id: id,
    },
  })

  res.json({ allocations })
}

/**
 * POST /store/harvests/:id/allocations
 * 
 * Create allocations for a harvest
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const harvestService = req.scope.resolve(HARVEST_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get the harvest
  const { data: [harvest] } = await query.graph({
    entity: "harvest",
    fields: ["id", "garden_id", "quantity", "estimated_value"],
    filters: { id },
  })

  if (!harvest) {
    res.status(404).json({ message: "Harvest not found" })
    return
  }

  // Get allocation rules for this garden
  const { data: rules } = await query.graph({
    entity: "allocation_rule",
    fields: ["pool_type", "percentage"],
    filters: {
      garden_id: harvest.garden_id,
      is_active: true,
    },
  })

  // Use default rules if none configured
  const allocationRules = rules.length > 0 
    ? rules 
    : [
        { pool_type: "investor", percentage: 20 },
        { pool_type: "volunteer", percentage: 20 },
        { pool_type: "plot_holder", percentage: 30 },
        { pool_type: "communal", percentage: 15 },
        { pool_type: "open_market", percentage: 10 },
        { pool_type: "donation", percentage: 5 },
      ]

  // Create allocations
  const allocations = await Promise.all(
    allocationRules.map(rule => 
      harvestService.createHarvestAllocations({
        harvest_id: id,
        garden_id: harvest.garden_id,
        pool_type: rule.pool_type,
        percentage: rule.percentage,
        allocated_quantity: (harvest.quantity * rule.percentage) / 100,
        allocated_value: (harvest.estimated_value * rule.percentage) / 100,
        claimed_quantity: 0,
        remaining_quantity: (harvest.quantity * rule.percentage) / 100,
        status: "open",
        claim_deadline: HarvestAllocationEngine.getClaimDeadline(
          rule.pool_type as any,
          new Date()
        ),
      })
    )
  )

  // Update harvest allocation status
  await harvestService.updateHarvests({
    id,
    allocation_status: "allocated",
  })

  res.status(201).json({ allocations })
}
