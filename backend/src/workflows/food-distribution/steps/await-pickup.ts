import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DISTRIBUTION_MODULE } from "../../../../modules/food-distribution"
import type FoodDistributionService from "../../../../modules/food-distribution/service"

type AwaitPickupInput = {
  delivery_id: string
  order_id: string
}

/**
 * Async step that waits for courier to pick up the order.
 */
export const awaitPickupStepId = "await-pickup-step"
export const awaitPickupStep = createStep(
  { name: awaitPickupStepId, async: true },
  async (input: AwaitPickupInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Log event
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "waiting",
      description: "Waiting for courier to pick up order",
    })

    return new StepResponse({ waiting: true, delivery_id: input.delivery_id })
  }
)

type ConfirmPickupInput = {
  delivery_id: string
  order_id: string
  latitude?: number
  longitude?: number
}

/**
 * Called when courier confirms pickup.
 */
export const confirmPickupStepId = "confirm-pickup-step"
export const confirmPickupStep = createStep(
  { name: confirmPickupStepId, async: false },
  async (input: ConfirmPickupInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    const location = input.latitude && input.longitude
      ? { latitude: input.latitude, longitude: input.longitude }
      : undefined

    // Update delivery status
    await foodDistribution.updateDeliveryStatus(
      input.delivery_id,
      "ORDER_PICKED_UP",
      location,
      "Order picked up by courier"
    )

    // Update order status
    await foodDistribution.updateFoodOrders({
      id: input.order_id,
      status: "OUT_FOR_DELIVERY",
    })

    return new StepResponse({ picked_up: true })
  }
)
