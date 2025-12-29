import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { HARVEST_MODULE } from "../../modules/harvest"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HarvestAllocationEngine, PoolType } from "../../modules/harvest/services/allocation-engine"

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
    const harvestService = container.resolve(HARVEST_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Get harvest
    const { data: [harvest] } = await query.graph({
      entity: "harvest",
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

    // Create allocations
    const allocationIds: string[] = []
    
    for (const rule of allocationRules) {
      const allocatedQuantity = (harvest.quantity * rule.percentage) / 100
      const allocatedValue = (harvest.estimated_value * rule.percentage) / 100

      const allocation = await harvestService.createHarvestAllocations({
        harvest_id: input.harvest_id,
        garden_id: harvest.garden_id,
        pool_type: rule.pool_type,
        percentage: rule.percentage,
        allocated_quantity: allocatedQuantity,
        allocated_value: allocatedValue,
        claimed_quantity: 0,
        remaining_quantity: allocatedQuantity,
        status: "open",
        claim_deadline: HarvestAllocationEngine.getClaimDeadline(
          rule.pool_type as PoolType,
          new Date()
        ),
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
    
    const harvestService = container.resolve(HARVEST_MODULE)
    
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
