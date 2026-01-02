import { 
  createWorkflow,
  when,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  createRemoteLinkStep,
  completeCartWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { SubscriptionInterval, SubscriptionType } from "../../../modules/subscription/types"
import { createSubscriptionStep } from "../steps/create-subscription"
import subscriptionOrderLink from "../../../links/subscription-order"

type WorkflowInput = {
  cart_id: string
  subscription_data: {
    interval: SubscriptionInterval
    period: number
    type?: SubscriptionType
    delivery_day?: string
    delivery_instructions?: string
  }
}

/**
 * Create Subscription Workflow
 * 
 * Creates a new subscription from a cart checkout:
 * 1. Completes the cart (creates initial order)
 * 2. Retrieves order details
 * 3. Creates subscription record
 * 4. Links subscription to order, cart, customer
 */
export const createSubscriptionWorkflowId = "create-subscription-workflow"
export const createSubscriptionWorkflow = createWorkflow(
  createSubscriptionWorkflowId,
  (input: WorkflowInput) => {
    // Complete the cart and create the initial order
    const { id } = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id
      }
    })

    // Get the created order details
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
        "items.variant.product.seller_id",
      ],
      filters: {
        id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    // Check if subscription already exists for this order
    const { data: existingLinks } = useQueryGraphStep({
      entity: subscriptionOrderLink.entryPoint,
      fields: ["subscription.id"],
      filters: { order_id: orders[0].id },
    }).config({ name: "retrieve-existing-links" })

    // Only create subscription if one doesn't exist
    const subscription = when(
      "create-subscription-condition",
      { existingLinks },
      (data) => data.existingLinks.length === 0
    )
    .then(() => {
      // Extract seller_id and product info from first item
      const firstItem = orders[0].items?.[0]
      const sellerId = firstItem?.variant?.product?.seller_id
      const productId = firstItem?.variant?.product?.id
      const variantId = firstItem?.variant?.id
      const quantity = firstItem?.quantity

      const { subscription, linkDefs } = createSubscriptionStep({
        cart_id: input.cart_id,
        order_id: orders[0].id,
        customer_id: orders[0].customer_id!,
        seller_id: sellerId,
        product_id: productId,
        variant_id: variantId,
        quantity,
        subscription_data: input.subscription_data
      })
  
      createRemoteLinkStep(linkDefs)

      return subscription
    })

    return new WorkflowResponse({
      subscription,
      order: orders[0]
    })
  }
)
