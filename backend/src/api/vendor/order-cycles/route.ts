import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_CYCLE_MODULE } from "../../../modules/order-cycle"
import type OrderCycleModuleService from "../../../modules/order-cycle/service"

/**
 * Vendor API Routes for Order Cycles
 * 
 * These routes are intended for the vendor panel and follow
 * MercurJS's vendor API pattern at /vendor/order-cycles
 */

// GET /vendor/order-cycles - List order cycles for the current seller
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderCycleService = req.scope.resolve<OrderCycleModuleService>(ORDER_CYCLE_MODULE)
  
  // Get current seller from authenticated context
  // MercurJS uses req.auth_context.actor_id for the seller
  const sellerId = (req as any).auth_context?.actor_id
  
  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  
  // Parse query parameters
  const { status, limit = "20", offset = "0" } = req.query as {
    status?: string
    limit?: string
    offset?: string
  }
  
  const limitNum = parseInt(limit, 10)
  const offsetNum = parseInt(offset, 10)
  
  // Build filters
  const filters: Record<string, unknown> = {}
  
  if (status) {
    filters.status = status.split(",")
  }
  
  // Get cycles where this seller participates
  const sellerCycles = await orderCycleService.listOrderCycleSellers({
    seller_id: sellerId,
    is_active: true,
  })
  
  const cycleIds = sellerCycles.map((sc) => sc.id)
  
  if (cycleIds.length === 0) {
    return res.json({
      order_cycles: [],
      count: 0,
      limit: limitNum,
      offset: offsetNum,
    })
  }
  
  filters.id = cycleIds
  
  // Get order cycles
  const orderCycles = await orderCycleService.listOrderCycles(filters, {
    take: limitNum,
    skip: offsetNum,
    order: { opens_at: "DESC" },
  })
  
  const allCycles = await orderCycleService.listOrderCycles(filters)
  
  res.json({
    order_cycles: orderCycles,
    count: allCycles.length,
    limit: limitNum,
    offset: offsetNum,
  })
}

// POST /vendor/order-cycles - Create a new order cycle
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderCycleService = req.scope.resolve<OrderCycleModuleService>(ORDER_CYCLE_MODULE)
  
  const sellerId = (req as any).auth_context?.actor_id
  
  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  
  const {
    name,
    description,
    opens_at,
    closes_at,
    dispatch_at,
    pickup_instructions,
    pickup_location,
    is_recurring,
    recurrence_rule,
  } = req.body as {
    name: string
    description?: string
    opens_at: string
    closes_at: string
    dispatch_at: string
    pickup_instructions?: string
    pickup_location?: string
    is_recurring?: boolean
    recurrence_rule?: string
  }
  
  // Validate required fields
  if (!name || !opens_at || !closes_at || !dispatch_at) {
    return res.status(400).json({
      message: "Missing required fields: name, opens_at, closes_at, dispatch_at",
    })
  }
  
  // Validate dates
  const openDate = new Date(opens_at)
  const closeDate = new Date(closes_at)
  const dispatchDate = new Date(dispatch_at)
  
  if (closeDate <= openDate) {
    return res.status(400).json({
      message: "closes_at must be after opens_at",
    })
  }
  
  if (dispatchDate < closeDate) {
    return res.status(400).json({
      message: "dispatch_at must be on or after closes_at",
    })
  }
  
  // Determine initial status
  const now = new Date()
  let status: "draft" | "upcoming" | "open" = "draft"
  if (openDate <= now && closeDate > now) {
    status = "open"
  } else if (openDate > now) {
    status = "upcoming"
  }
  
  // Create order cycle
  const orderCycle = await orderCycleService.createOrderCycles({
    name,
    description,
    opens_at: openDate,
    closes_at: closeDate,
    dispatch_at: dispatchDate,
    status,
    coordinator_seller_id: sellerId,
    pickup_instructions,
    pickup_location,
    is_recurring: is_recurring || false,
    recurrence_rule,
  })
  
  // Add creator as coordinator
  await orderCycleService.addSellerToOrderCycle(
    orderCycle.id,
    sellerId,
    "coordinator"
  )
  
  res.status(201).json({ order_cycle: orderCycle })
}
