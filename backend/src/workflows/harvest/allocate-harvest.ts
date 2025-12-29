import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const HARVEST_MODULE = "harvestModuleService"

interface HarvestServiceType {
  createHarvestAllocations: (data: Record<string, unknown>) => Promise<{ id: string }>
  deleteHarvestAllocations: (id: string) => Promise<void>
  updateHarvests: (data: Record<string, unknown>) => Promise<{ id: string }>
}

type PoolType = "investor" | "volunteer" | "plot_holder" | "communal" | "open_market" | "donation"

// Inline claim deadline calculation
function getClaimDeadline(poolType: PoolType, harvestDate: Date): Date {
  const deadlines: Record<PoolType, number> = {
    investor: 3,
    volunteer: 3,
    plot_holder: 5,
    communal: 7,
    open_market: 14,
    donation: 30,
  }
  
  const days = deadlines[poolType] || 7
  const deadline = new Date(harvestDate)
  deadline.setDate(deadline.getDate() + days)
  return deadline
}

/**
 * Allocate Harvest Workflow
 * 
 * Creates allocations for a harvest based on garden rules.
 */

type AllocateHarvestInput = {
  harvest_id: string
}

const allocateHarvestStep = createStep(
  "allocate-harvest-step",
  async (input: AllocateHarvestInput, { container }) => {
    const harvestService = container.resolve(HARVEST_MODULE) as HarvestServiceType
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Get harvest
    const { data: [harvest] } = await query.graph({
      entity: "garden_harvest",
      fields: ["id", "garden_id", "quantity", "estimated_value", "allocation_status"],
      filters: { id: input.harvest_id },
    })

    if (!harvest) {
      throw new Error("Harvest not found")
    }

    if (harvest.allocation_status !== "pending") {
      throw new Error("Harvest has already been allocated")
    }

    // Get allocation rules
    const { data: rules } = await query.graph({
      entity: "allocation_rule",
      fields: ["pool_type", "percentage"],
      filters: {
        garden_id: harvest.garden_id,
        is_active: true,
      },
    })

    // Use defaults if no rules
    const allocationRules = rules.length > 0 ? rules : [
      { pool_type: "investor", percentage: 20 },
      { pool_type: "volunteer", percentage: 20 },
      { pool_type: "plot_holder", percentage: 30 },
      { pool_type: "communal", percentage: 15 },
      { pool_type: "open_market", percentage: 10 },
      { pool_type: "donation", percentage: 5 },
    ]

    const harvestQuantity = harvest.quantity as number
    const estimatedValue = harvest.estimated_value as number

    // Create allocations
    const allocationIds: string[] = []
    
    for (const rule of allocationRules) {
      const rulePercentage = rule.percentage as number
      const poolType = rule.pool_type as PoolType
      const allocatedQuantity = (harvestQuantity * rulePercentage) / 100
      const allocatedValue = (estimatedValue * rulePercentage) / 100

      const allocation = await harvestService.createHarvestAllocations({
        harvest_id: input.harvest_id,
        garden_id: harvest.garden_id,
        pool_type: poolType,
        percentage: rulePercentage,
        allocated_quantity: allocatedQuantity,
        allocated_value: allocatedValue,
        claimed_quantity: 0,
        remaining_quantity: allocatedQuantity,
        status: "open",
        claim_deadline: getClaimDeadline(poolType, new Date()),
      })

      allocationIds.push(allocation.id)
    }

    // Update harvest status
    await harvestService.updateHarvests({
      id: input.harvest_id,
      allocation_status: "allocated",
    })

    return new StepResponse({
      harvest_id: input.harvest_id,
      allocation_count: allocationIds.length,
      allocation_ids: allocationIds,
    }, { harvestId: input.harvest_id, allocationIds })
  },
  async (context, { container }) => {
    if (!context) return
    
    const harvestService = container.resolve(HARVEST_MODULE) as HarvestServiceType
    
    // Delete allocations
    for (const id of context.allocationIds) {
      await harvestService.deleteHarvestAllocations(id)
    }
    
    // Revert harvest status
    await harvestService.updateHarvests({
      id: context.harvestId,
      allocation_status: "pending",
    })
  }
)

export const allocateHarvestWorkflow = createWorkflow(
  "allocate-harvest-workflow",
  (input: AllocateHarvestInput) => {
    const result = allocateHarvestStep(input)
    return new WorkflowResponse(result)
  }
)
