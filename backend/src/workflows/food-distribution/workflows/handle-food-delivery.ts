import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import {
  setWorkflowTransactionIdStep,
  notifyProducerStep,
  awaitCourierClaimStep,
  awaitPreparationStartStep,
  awaitOrderReadyStep,
  awaitPickupStep,
  awaitDeliveryCompletionStep,
  completeDeliveryStep,
} from "../steps"

type HandleFoodDeliveryWorkflowInput = {
  delivery_id: string
  order_id: string
  producer_id: string
}

// Workflow retention time: 4 hours
const FOUR_HOURS = 60 * 60 * 4

/**
 * Handle Food Delivery Workflow
 * 
 * A long-running workflow that manages the complete delivery lifecycle:
 * 
 * 1. Set transaction ID for tracking
 * 2. Notify producer of new order
 * 3. Wait for courier to claim delivery
 * 4. Wait for producer to start preparation
 * 5. Wait for order to be ready
 * 6. Wait for courier to pick up order
 * 7. Wait for delivery completion
 * 8. Complete and update stats
 * 
 * Each async step can be resumed via API when the corresponding action is taken.
 */
export const handleFoodDeliveryWorkflowId = "handle-food-delivery-workflow"
export const handleFoodDeliveryWorkflow = createWorkflow(
  {
    name: handleFoodDeliveryWorkflowId,
    store: true,
    retentionTime: FOUR_HOURS,
  },
  function (input: HandleFoodDeliveryWorkflowInput) {
    // Step 1: Set workflow transaction ID on delivery
    setWorkflowTransactionIdStep({
      delivery_id: input.delivery_id,
      transaction_id: "" // Will be populated by workflow engine
    })

    // Step 2: Notify producer about new order
    notifyProducerStep({
      delivery_id: input.delivery_id,
      producer_id: input.producer_id,
      order_id: input.order_id,
    })

    // Step 3: Wait for courier to claim delivery (async)
    awaitCourierClaimStep({
      delivery_id: input.delivery_id,
    })

    // Step 4: Wait for producer to start preparation (async)
    awaitPreparationStartStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
    })

    // Step 5: Wait for order to be ready (async)
    awaitOrderReadyStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
    })

    // Step 6: Wait for courier to pick up (async)
    awaitPickupStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
    })

    // Step 7: Wait for delivery completion (async)
    awaitDeliveryCompletionStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
    })

    // Step 8: Complete delivery and update stats
    completeDeliveryStep({
      delivery_id: input.delivery_id,
      order_id: input.order_id,
      courier_id: "", // Will be populated from delivery
    })

    return new WorkflowResponse({
      message: "Delivery completed successfully",
      delivery_id: input.delivery_id,
    })
  }
)
