import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { fulfillDigitalOrderWorkflow } from "../workflows/fulfill-digital-order"

async function digitalProductOrderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await fulfillDigitalOrderWorkflow(container).run({
      input: {
        id: data.id
      }
    })
  } catch (error) {
    console.error(`[digital-order] Failed to fulfill digital order ${data.id}:`, error)
    // Don't throw - subscriber failure shouldn't crash the event bus
  }
}

export default digitalProductOrderCreatedHandler

export const config: SubscriberConfig = {
  event: "digital_product_order.created",
}