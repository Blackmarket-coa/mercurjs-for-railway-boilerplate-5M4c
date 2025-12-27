import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_CYCLE_MODULE } from "../../modules/order-cycle"

/**
 * Subscriber: Track Order Cycle Sales
 * 
 * When an order is placed, if it contains products from an order cycle:
 * - Update sold_quantity for each cycle product
 * - Link the order to the order cycle
 */

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id
  const orderCycleService = container.resolve(ORDER_CYCLE_MODULE)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  
  console.log(`[Order Cycle Subscriber] Processing order ${orderId}`)
  
  try {
    // Get order with line items
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "items.*",
        "metadata",
      ],
      filters: {
        id: orderId,
      },
    })
    
    if (!order) {
      console.log(`[Order Cycle Subscriber] Order ${orderId} not found`)
      return
    }
    
    // Check if order has an order_cycle_id in metadata
    const orderCycleId = order.metadata?.order_cycle_id as string
    
    if (!orderCycleId) {
      // Order wasn't placed through an order cycle
      return
    }
    
    console.log(`[Order Cycle Subscriber] Order ${orderId} placed in cycle ${orderCycleId}`)
    
    // Verify the order cycle exists and is valid
    let orderCycle
    try {
      orderCycle = await orderCycleService.retrieveOrderCycle(orderCycleId)
    } catch {
      console.log(`[Order Cycle Subscriber] Order cycle ${orderCycleId} not found`)
      return
    }
    
    // Update sold quantities for each item
    for (const item of order.items || []) {
      const variantId = item.variant_id
      const quantity = item.quantity
      
      try {
        await orderCycleService.recordSale(orderCycleId, variantId, quantity)
        console.log(`[Order Cycle Subscriber] Recorded sale: ${quantity}x ${variantId}`)
      } catch (error) {
        // Product might not be in the cycle - that's okay
        console.log(`[Order Cycle Subscriber] Could not record sale for ${variantId}:`, error)
      }
    }
    
    // Link order to order cycle
    try {
      await remoteLink.create({
        [ContainerRegistrationKeys.ORDER]: {
          order_id: orderId,
        },
        [ORDER_CYCLE_MODULE]: {
          order_cycle_id: orderCycleId,
        },
      })
      console.log(`[Order Cycle Subscriber] Linked order ${orderId} to cycle ${orderCycleId}`)
    } catch (error) {
      console.log(`[Order Cycle Subscriber] Could not link order:`, error)
    }
    
  } catch (error) {
    console.error(`[Order Cycle Subscriber] Error processing order ${orderId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
