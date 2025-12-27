import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_CYCLE_MODULE } from "../../../../modules/order-cycle"

/**
 * Vendor API Routes for Single Order Cycle
 * 
 * GET /vendor/order-cycles/:id - Get order cycle details
 * PUT /vendor/order-cycles/:id - Update order cycle
 * DELETE /vendor/order-cycles/:id - Delete order cycle
 */

// GET /vendor/order-cycles/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderCycleService = req.scope.resolve(ORDER_CYCLE_MODULE)
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params
  
  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  
  try {
    const orderCycle = await orderCycleService.retrieveOrderCycle(id, {
      relations: ["products", "sellers"],
    })
    
    // Check seller has access
    const hasAccess = orderCycle.sellers?.some(
      (s: any) => s.seller_id === sellerId && s.is_active
    ) || orderCycle.coordinator_seller_id === sellerId
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" })
    }
    
    res.json({ order_cycle: orderCycle })
  } catch (error) {
    res.status(404).json({ message: "Order cycle not found" })
  }
}

// PUT /vendor/order-cycles/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderCycleService = req.scope.resolve(ORDER_CYCLE_MODULE)
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params
  
  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  
  try {
    const orderCycle = await orderCycleService.retrieveOrderCycle(id)
    
    // Only coordinator can update
    if (orderCycle.coordinator_seller_id !== sellerId) {
      return res.status(403).json({ 
        message: "Only the coordinator can update this order cycle" 
      })
    }
    
    const {
      name,
      description,
      opens_at,
      closes_at,
      dispatch_at,
      status,
      pickup_instructions,
      pickup_location,
      is_recurring,
      recurrence_rule,
    } = req.body
    
    const updates: any = {}
    
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (opens_at !== undefined) updates.opens_at = new Date(opens_at)
    if (closes_at !== undefined) updates.closes_at = new Date(closes_at)
    if (dispatch_at !== undefined) updates.dispatch_at = new Date(dispatch_at)
    if (status !== undefined) updates.status = status
    if (pickup_instructions !== undefined) updates.pickup_instructions = pickup_instructions
    if (pickup_location !== undefined) updates.pickup_location = pickup_location
    if (is_recurring !== undefined) updates.is_recurring = is_recurring
    if (recurrence_rule !== undefined) updates.recurrence_rule = recurrence_rule
    
    const updated = await orderCycleService.updateOrderCycles(id, updates)
    
    res.json({ order_cycle: updated })
  } catch (error) {
    res.status(404).json({ message: "Order cycle not found" })
  }
}

// DELETE /vendor/order-cycles/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderCycleService = req.scope.resolve(ORDER_CYCLE_MODULE)
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params
  
  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  
  try {
    const orderCycle = await orderCycleService.retrieveOrderCycle(id)
    
    // Only coordinator can delete
    if (orderCycle.coordinator_seller_id !== sellerId) {
      return res.status(403).json({ 
        message: "Only the coordinator can delete this order cycle" 
      })
    }
    
    // Don't allow deletion of cycles with orders (soft delete instead)
    // For now, just mark as cancelled
    if (orderCycle.status === "open" || orderCycle.status === "closed") {
      await orderCycleService.updateOrderCycles(id, { status: "cancelled" })
      res.json({ 
        message: "Order cycle cancelled (had active orders)",
        order_cycle: { ...orderCycle, status: "cancelled" },
      })
    } else {
      await orderCycleService.deleteOrderCycles(id)
      res.json({ message: "Order cycle deleted" })
    }
  } catch (error) {
    res.status(404).json({ message: "Order cycle not found" })
  }
}
