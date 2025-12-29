import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { processOrderReadyStep } from "../steps/await-order-preparation"

type OrderReadyWorkflowInput = {
  delivery_id: string
  order_id: string
}

/**
 * Order Ready Workflow
 * 
 * Called when producer marks order as ready for pickup.
 * This will resume the main handle-food-delivery workflow.
 */
export const orderReadyWorkflowId = "order-ready-workflow"
export const orderReadyWorkflow = createWorkflow(
  orderReadyWorkflowId,
  function (input: OrderReadyWorkflowInput) {
    const result = processOrderReadyStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
    })

    return new WorkflowResponse(result)
  }
)
