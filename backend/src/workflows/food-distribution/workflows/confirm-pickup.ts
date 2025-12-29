import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { confirmPickupStep } from "../steps/await-pickup"

type ConfirmPickupWorkflowInput = {
  delivery_id: string
  order_id: string
  latitude?: number
  longitude?: number
}

/**
 * Confirm Pickup Workflow
 * 
 * Called when courier confirms order pickup.
 * This will resume the main handle-food-delivery workflow.
 */
export const confirmPickupWorkflowId = "confirm-pickup-workflow"
export const confirmPickupWorkflow = createWorkflow(
  confirmPickupWorkflowId,
  function (input: ConfirmPickupWorkflowInput) {
    const result = confirmPickupStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
      latitude: input.latitude,
      longitude: input.longitude,
    })

    return new WorkflowResponse(result)
  }
)
