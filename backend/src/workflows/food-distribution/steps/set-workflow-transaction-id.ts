import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DISTRIBUTION_MODULE } from "../../../modules/food-distribution"
import type FoodDistributionService from "../../../modules/food-distribution/service"

type SetWorkflowTransactionIdInput = {
  delivery_id: string
  transaction_id: string
}

export const setWorkflowTransactionIdStepId = "set-workflow-transaction-id-step"
export const setWorkflowTransactionIdStep = createStep(
  { name: setWorkflowTransactionIdStepId, async: false },
  async (input: SetWorkflowTransactionIdInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    await foodDistribution.updateFoodDeliveries({
      id: input.delivery_id,
      workflow_transaction_id: input.transaction_id,
    })

    return new StepResponse({ success: true })
  }
)
