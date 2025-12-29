import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DISTRIBUTION_MODULE } from "../../../modules/food-distribution"
import type FoodDistributionService from "../../../modules/food-distribution/service"

type AwaitCourierClaimInput = {
  delivery_id: string
}

/**
 * Async step that waits for a courier to claim the delivery.
 * This step will be resumed when a courier claims the delivery via API.
 */
export const awaitCourierClaimStepId = "await-courier-claim-step"
export const awaitCourierClaimStep = createStep(
  { name: awaitCourierClaimStepId, async: true },
  async (input: AwaitCourierClaimInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Log that we're waiting for courier
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "waiting",
      description: "Waiting for courier to claim delivery",
    })

    // The step will be resumed when courier claims via API
    return new StepResponse({ waiting: true, delivery_id: input.delivery_id })
  }
)

type AwaitCourierClaimResultInput = {
  delivery_id: string
  courier_id: string
}

/**
 * Called when courier claims the delivery
 */
export const processCourierClaimStepId = "process-courier-claim-step"
export const processCourierClaimStep = createStep(
  { name: processCourierClaimStepId, async: false },
  async (input: AwaitCourierClaimResultInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Assign courier to delivery
    const delivery = await foodDistribution.assignCourierToDelivery(
      input.delivery_id,
      input.courier_id
    )

    // Get courier info
    const courier = await foodDistribution.retrieveCourier(input.courier_id)

    return new StepResponse({
      delivery,
      courier: {
        id: courier?.id,
        name: `${courier?.first_name} ${courier?.last_name}`,
        vehicle_type: courier?.vehicle_type,
      },
    })
  }
)
