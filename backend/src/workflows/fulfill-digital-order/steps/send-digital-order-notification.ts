import { createWorkflow, StepResponse, workflowRegistry } from "@medusajs/framework/workflows-sdk"
import { sendDigitalOrderNotificationStep } from "./steps/send-digital-order-notification"
import { MedusaError } from "@medusajs/framework/utils"

// Define the input type for the workflow
export type DigitalOrderWorkflowInput = {
  digital_product_order: any // Replace `any` with `DigitalProductOrder` if imported
}

// Create the workflow
export const digitalOrderFulfillmentWorkflow = createWorkflow(
  "digital-order-fulfillment-v1", // ✅ Unique workflow ID
  async (input: DigitalOrderWorkflowInput, { container }) => {
    try {
      // Execute the notification step
      const notificationResponse: StepResponse = await sendDigitalOrderNotificationStep.run(input, { container })

      // You could add more steps here, e.g., mark order as fulfilled, log activity, etc.

      return notificationResponse
    } catch (error) {
      // Handle workflow errors gracefully
      if (error instanceof MedusaError) {
        throw error
      }
      throw new MedusaError(MedusaError.Types.INTERNAL, `Workflow failed: ${error}`)
    }
  }
)

// Register the workflow safely
if (!workflowRegistry.has("digital-order-fulfillment-v1")) {
  workflowRegistry.register(digitalOrderFulfillmentWorkflow)
}

