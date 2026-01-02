import { 
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { updateSubscriptionStep } from "../steps/update-subscription"

type WorkflowInput = {
  subscription_id: string
  action: "pause" | "resume" | "cancel"
  reason?: string
}

/**
 * Manage Subscription Workflow
 * 
 * Handles subscription lifecycle actions:
 * - Pause: Temporarily suspend subscription
 * - Resume: Reactivate paused subscription
 * - Cancel: Permanently end subscription
 */
export const manageSubscriptionWorkflowId = "manage-subscription-workflow"
export const manageSubscriptionWorkflow = createWorkflow(
  manageSubscriptionWorkflowId,
  (input: WorkflowInput) => {
    const { subscription } = updateSubscriptionStep({
      subscription_id: input.subscription_id,
      action: input.action,
      reason: input.reason
    })

    return new WorkflowResponse({
      subscription,
      action: input.action,
      success: true
    })
  }
)
