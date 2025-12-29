import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DISTRIBUTION_MODULE } from "../../../modules/food-distribution"
import type FoodDistributionService from "../../../modules/food-distribution/service"
import { FoodOrderStatus } from "../../../modules/food-distribution/models/food-order"
import { CourierStatus } from "../../../modules/food-distribution/models/courier"

type CompleteDeliveryInput = {
  delivery_id: string
  order_id: string
  courier_id: string
}

/**
 * Final step to complete delivery workflow and update all statuses.
 */
export const completeDeliveryStepId = "complete-delivery-step"
export const completeDeliveryStep = createStep(
  { name: completeDeliveryStepId, async: false },
  async (input: CompleteDeliveryInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Get the delivery
    const delivery = await foodDistribution.retrieveFoodDelivery(input.delivery_id)
    if (!delivery) {
      throw new Error(`Delivery ${input.delivery_id} not found`)
    }

    // Calculate duration
    const createdAt = new Date(delivery.created_at)
    const deliveredAt = delivery.delivered_at ? new Date(delivery.delivered_at) : new Date()
    const durationMinutes = Math.round((deliveredAt.getTime() - createdAt.getTime()) / 60000)

    // Update delivery as completed
    await foodDistribution.updateFoodDeliveries({
      id: input.delivery_id,
      actual_duration_minutes: durationMinutes,
    } as any)

    // Update order as completed
    await foodDistribution.updateFoodOrders({
      id: input.order_id,
      status: FoodOrderStatus.COMPLETED,
      completed_at: new Date(),
    } as any)

    // Update courier stats
    const courier = await foodDistribution.retrieveCourier(input.courier_id)
    if (courier) {
      await foodDistribution.updateCouriers({
        id: input.courier_id,
        status: CourierStatus.AVAILABLE,
        total_deliveries: (courier.total_deliveries || 0) + 1,
        total_earnings: (Number(courier.total_earnings) || 0) + (Number(delivery.courier_earnings) || 0),
      } as any)
    }

    // Log completion
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "completed",
      description: `Delivery completed in ${durationMinutes} minutes`,
      metadata: {
        duration_minutes: durationMinutes,
        courier_id: input.courier_id,
      },
    })

    return new StepResponse({
      completed: true,
      duration_minutes: durationMinutes,
    })
  }
)
