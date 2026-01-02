import { 
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  useQueryGraphStep,
  createRemoteLinkStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import { SubscriptionData } from "../../../modules/subscription/types"
import { updateSubscriptionStep } from "../steps/update-subscription"

type WorkflowInput = {
  subscription_id: string
}

/**
 * Renew Subscription Workflow
 * 
 * Creates a new order for an existing subscription:
 * 1. Retrieves subscription with linked cart
 * 2. Creates new order from cart template
 * 3. Links new order to subscription
 * 4. Updates subscription dates
 * 
 * NOTE: This is a simplified version. Full implementation would:
 * - Create payment collection
 * - Capture payment from saved method
 * - Handle payment failures
 */
export const renewSubscriptionWorkflowId = "renew-subscription-workflow"
export const renewSubscriptionWorkflow = createWorkflow(
  renewSubscriptionWorkflowId,
  (input: WorkflowInput) => {
    // Get subscription with cart details
    const { data: subscriptions } = useQueryGraphStep({
      entity: "subscription",
      fields: [
        "*",
        "cart.*",
        "cart.items.*",
        "cart.items.variant.*",
        "cart.shipping_address.*",
        "cart.billing_address.*",
        "cart.shipping_methods.*",
        "customer.*",
      ],
      filters: {
        id: input.subscription_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    // Transform cart data into order data
    const orderData = transform({
      subscriptions
    }, (data) => {
      const subscription = data.subscriptions[0]
      const cart = subscription.cart

      if (!cart) {
        throw new Error("Subscription has no linked cart for renewal")
      }

      return {
        region_id: cart.region_id,
        customer_id: subscription.customer_id,
        sales_channel_id: cart.sales_channel_id,
        email: cart.email,
        currency_code: cart.currency_code,
        shipping_address: cart.shipping_address ? {
          ...cart.shipping_address,
          id: undefined
        } : undefined,
        billing_address: cart.billing_address ? {
          ...cart.billing_address,
          id: undefined
        } : undefined,
        items: cart.items?.map((item: any) => ({
          variant_id: item.variant_id,
          quantity: subscription.quantity || item.quantity,
          unit_price: item.unit_price,
          title: item.title,
        })),
        metadata: {
          subscription_id: subscription.id,
          renewal: true,
          renewal_date: new Date().toISOString()
        }
      }
    })

    // Note: In production, you would:
    // 1. Create order using createOrderWorkflow
    // 2. Create payment collection
    // 3. Capture payment from saved method
    // 4. Link order to subscription

    // Update subscription to record the renewal
    const { subscription } = updateSubscriptionStep({
      subscription_id: input.subscription_id,
      action: "record_order"
    })

    return new WorkflowResponse({
      subscription,
      renewal_prepared: true,
      order_data: orderData
    })
  }
)
