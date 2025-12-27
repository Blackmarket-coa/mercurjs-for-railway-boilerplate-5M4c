import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_CYCLE_MODULE } from "../../../modules/order-cycle"

/**
 * Store API Routes for Order Cycles
 * 
 * Public endpoints for customers to view active order cycles
 * GET /store/order-cycles - List open order cycles
 */

// GET /store/order-cycles
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderCycleService = req.scope.resolve(ORDER_CYCLE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { 
    seller_id,
    include_upcoming = "false",
    limit = 20,
    offset = 0,
  } = req.query as {
    seller_id?: string
    include_upcoming?: string
    limit?: number
    offset?: number
  }
  
  const now = new Date()
  
  // Build filters for open cycles
  const filters: any = {
    status: include_upcoming === "true" ? ["open", "upcoming"] : ["open"],
  }
  
  // If requesting cycles for a specific seller
  if (seller_id) {
    const sellerCycles = await orderCycleService.listOrderCycleSellers({
      seller_id,
      is_active: true,
    })
    
    const cycleIds = sellerCycles.map((sc: any) => sc.order_cycle_id)
    
    if (cycleIds.length === 0) {
      return res.json({
        order_cycles: [],
        count: 0,
        limit,
        offset,
      })
    }
    
    filters.id = cycleIds
  }
  
  // Get order cycles
  const orderCycles = await orderCycleService.listOrderCycles(filters, {
    take: limit,
    skip: offset,
    order: { opens_at: "ASC" },
  })
  
  // For each cycle, get visible products count
  const cyclesWithMeta = await Promise.all(
    orderCycles.map(async (cycle: any) => {
      const products = await orderCycleService.listOrderCycleProducts({
        order_cycle_id: cycle.id,
        is_visible: true,
      })
      
      const sellers = await orderCycleService.listOrderCycleSellers({
        order_cycle_id: cycle.id,
        is_active: true,
      })
      
      return {
        ...cycle,
        product_count: products.length,
        seller_count: sellers.length,
        // Don't expose coordinator_seller_id to store
        coordinator_seller_id: undefined,
      }
    })
  )
  
  res.json({
    order_cycles: cyclesWithMeta,
    count: orderCycles.length,
    limit,
    offset,
  })
}
