import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { confirmDeliveryStep } from "../steps/await-delivery-completion"

type ConfirmDeliveryWorkflowInput = {
  delivery_id: string
  order_id: string
  proof_type: string
  proof_data?: {
    photo_url?: string
    signature_url?: string
    pin_code?: string
    recipient_name?: string
    notes?: string
  }
  latitude?: number
  longitude?: number
}

/**
 * Confirm Delivery Workflow
 * 
 * Called when courier confirms delivery completion.
 * This will resume the main handle-food-delivery workflow.
 */
export const confirmDeliveryWorkflowId = "confirm-delivery-workflow"
export const confirmDeliveryWorkflow = createWorkflow(
  confirmDeliveryWorkflowId,
  function (input: ConfirmDeliveryWorkflowInput) {
    const result = confirmDeliveryStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
      proof_type: input.proof_type,
      proof_data: input.proof_data,
      latitude: input.latitude,
      longitude: input.longitude,
    })

    return new WorkflowResponse(result)
  }
)
