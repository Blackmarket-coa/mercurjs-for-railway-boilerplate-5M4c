import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DISTRIBUTION_MODULE } from "../../../modules/food-distribution"
import type FoodDistributionService from "../../../modules/food-distribution/service"
import { FoodOrderStatus } from "../../../modules/food-distribution/models/food-order"
import { DeliveryStatus } from "../../../modules/food-distribution/models/delivery"

type AwaitOrderPreparationInput = {
  delivery_id: string
  order_id: string
}

/**
 * Async step that waits for the producer to confirm order preparation has started.
 */
export const awaitPreparationStartStepId = "await-preparation-start-step"
export const awaitPreparationStartStep = createStep(
  { name: awaitPreparationStartStepId, async: true },
  async (input: AwaitOrderPreparationInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Update order status
    await foodDistribution.updateFoodOrders({
      id: input.order_id,
      status: FoodOrderStatus.CONFIRMED,
    } as any)

    // Log event
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "waiting",
      description: "Waiting for producer to start preparation",
    })

    return new StepResponse({ waiting: true, delivery_id: input.delivery_id })
  }
)

/**
 * Async step that waits for the producer to confirm order is ready.
 */
export const awaitOrderReadyStepId = "await-order-ready-step"
export const awaitOrderReadyStep = createStep(
  { name: awaitOrderReadyStepId, async: true },
  async (input: AwaitOrderPreparationInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Update order status
    await foodDistribution.updateFoodOrders({
      id: input.order_id,
      status: FoodOrderStatus.PREPARING,
    } as any)

    // Log event
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "status_change",
      new_status: "PREPARING",
      description: "Order preparation started",
    })

    return new StepResponse({ waiting: true, delivery_id: input.delivery_id })
  }
)

/**
 * Called when producer confirms order is ready for pickup.
 */
export const processOrderReadyStepId = "process-order-ready-step"
export const processOrderReadyStep = createStep(
  { name: processOrderReadyStepId, async: false },
  async (input: AwaitOrderPreparationInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Update order status
    await foodDistribution.updateFoodOrders({
      id: input.order_id,
      status: FoodOrderStatus.READY,
    } as any)

    // Update delivery status
    await foodDistribution.updateDeliveryStatus(input.delivery_id, DeliveryStatus.WAITING_FOR_ORDER)

    // Log event
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "status_change",
      new_status: "READY",
      description: "Order is ready for pickup",
    })

    return new StepResponse({ ready: true })
  }
)
