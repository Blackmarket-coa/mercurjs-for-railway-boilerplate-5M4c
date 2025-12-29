import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { processCourierClaimStep } from "../steps/await-courier-claim"

type ClaimDeliveryWorkflowInput = {
  delivery_id: string
  courier_id: string
}

/**
 * Claim Delivery Workflow
 * 
 * Called when a courier claims an available delivery.
 * This will resume the main handle-food-delivery workflow.
 */
export const claimFoodDeliveryWorkflowId = "claim-food-delivery-workflow"
export const claimFoodDeliveryWorkflow = createWorkflow(
  claimFoodDeliveryWorkflowId,
  function (input: ClaimDeliveryWorkflowInput) {
    const result = processCourierClaimStep({
      delivery_id: input.delivery_id,
      courier_id: input.courier_id,
    })

    return new WorkflowResponse(result)
  }
)
