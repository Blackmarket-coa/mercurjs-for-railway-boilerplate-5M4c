import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DISTRIBUTION_MODULE } from "../../../modules/food-distribution"
import type FoodDistributionService from "../../../modules/food-distribution/service"

type NotifyProducerInput = {
  delivery_id: string
  producer_id: string
  order_id: string
}

export const notifyProducerStepId = "notify-producer-step"
export const notifyProducerStep = createStep(
  { name: notifyProducerStepId, async: false },
  async (input: NotifyProducerInput, { container }) => {
    const foodDistribution = container.resolve<FoodDistributionService>(FOOD_DISTRIBUTION_MODULE)

    // Get producer details
    const producer = await foodDistribution.retrieveFoodProducer(input.producer_id)
    if (!producer) {
      throw new Error(`Producer ${input.producer_id} not found`)
    }

    // Log event
    await foodDistribution.logDeliveryEvent(input.delivery_id, {
      event_type: "notification",
      description: `Notification sent to producer: ${producer.name}`,
      metadata: {
        producer_id: input.producer_id,
        order_id: input.order_id,
        notification_type: "new_order",
      },
    })

    // TODO: Integrate with notification service (email, SMS, push)
    // This would trigger actual notifications in production

    return new StepResponse({
      notified: true,
      producer_name: producer.name,
      producer_email: producer.email,
    })
  }
)
