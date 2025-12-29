import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const HARVEST_MODULE = "harvestModuleService"

interface HarvestServiceType {
  createHarvestClaims: (data: Record<string, unknown>) => Promise<{ id: string }>
  deleteHarvestClaims: (id: string) => Promise<void>
  updateHarvestAllocations: (data: Record<string, unknown>) => Promise<{ id: string }>
}

/**
 * Claim Harvest Share Workflow
 * 
 * Claims a member's share from a harvest allocation.
 */

type ClaimHarvestInput = {
  harvest_id: string
  allocation_id: string
  customer_id: string
  membership_id: string
  quantity_requested: number
}

const claimHarvestStep = createStep(
  "claim-harvest-share-step",
  async (input: ClaimHarvestInput, { container }) => {
    const harvestService = container.resolve(HARVEST_MODULE) as HarvestServiceType
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Get allocation
    const { data: [allocation] } = await query.graph({
      entity: "harvest_allocation",
      fields: [
        "id",
        "remaining_quantity",
        "allocated_value",
        "allocated_quantity",
        "status",
        "claim_deadline",
      ],
      filters: { id: input.allocation_id },
    })

    if (!allocation) {
      throw new Error("Allocation not found")
    }

    if (allocation.status !== "open") {
      throw new Error("Allocation is not open for claims")
    }

    if (new Date() > new Date(allocation.claim_deadline as string)) {
      throw new Error("Claim deadline has passed")
    }

    const remainingQuantity = allocation.remaining_quantity as number
    const allocatedQuantity = allocation.allocated_quantity as number
    const allocatedValue = allocation.allocated_value as number

    if (remainingQuantity <= 0) {
      throw new Error("No remaining quantity to claim")
    }

    // Calculate claim amounts
    const quantity_claimed = Math.min(input.quantity_requested, remainingQuantity)
    const value_claimed = (quantity_claimed / allocatedQuantity) * allocatedValue

    // Create claim
    const claim = await harvestService.createHarvestClaims({
      harvest_id: input.harvest_id,
      allocation_id: input.allocation_id,
      customer_id: input.customer_id,
      membership_id: input.membership_id,
      quantity_claimed,
      value_claimed,
      status: "pending",
      claimed_at: new Date(),
    })

    // Update allocation
    const newRemaining = remainingQuantity - quantity_claimed
    const newClaimed = allocatedQuantity - newRemaining

    await harvestService.updateHarvestAllocations({
      id: input.allocation_id,
      remaining_quantity: newRemaining,
      claimed_quantity: newClaimed,
      status: newRemaining <= 0 ? "fully_claimed" : "open",
    })

    return new StepResponse({
      claim_id: claim.id,
      quantity_claimed,
      value_claimed,
      remaining_quantity: newRemaining,
    }, {
      claimId: claim.id,
      allocationId: input.allocation_id,
      quantityClaimed: quantity_claimed,
      previousRemaining: remainingQuantity,
    })
  },
  async (context, { container }) => {
    if (!context) return
    
    const harvestService = container.resolve(HARVEST_MODULE) as HarvestServiceType
    
    // Delete claim
    await harvestService.deleteHarvestClaims(context.claimId)
    
    // Restore allocation quantities
    await harvestService.updateHarvestAllocations({
      id: context.allocationId,
      remaining_quantity: context.previousRemaining,
      claimed_quantity: context.previousRemaining - context.quantityClaimed,
      status: "open",
    })
  }
)

export const claimHarvestShareWorkflow = createWorkflow(
  "claim-harvest-share-workflow",
  (input: ClaimHarvestInput) => {
    const result = claimHarvestStep(input)
    return new WorkflowResponse(result)
  }
)
