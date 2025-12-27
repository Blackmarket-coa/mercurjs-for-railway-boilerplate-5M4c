import { MedusaService } from "@medusajs/framework/utils"
import { OrderCycle, OrderCycleProduct, OrderCycleSeller } from "./models"

type OrderCycleStatus = "draft" | "upcoming" | "open" | "closed" | "dispatched" | "cancelled"

type InferredOrderCycle = {
  id: string
  name: string
  description: string | null
  opens_at: Date
  closes_at: Date
  dispatch_at: Date
  status: OrderCycleStatus
  coordinator_seller_id: string
  is_recurring: boolean
  recurrence_rule: string | null
  pickup_instructions: string | null
  pickup_location: string | null
  metadata: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  products?: InferredOrderCycleProduct[]
  sellers?: InferredOrderCycleSeller[]
}

type InferredOrderCycleProduct = {
  id: string
  order_cycle_id: string
  variant_id: string
  seller_id: string
  available_quantity: number | null
  sold_quantity: number
  price_override: number | null
  is_visible: boolean
  display_order: number
  metadata: Record<string, unknown> | null
}

type InferredOrderCycleSeller = {
  id: string
  order_cycle_id: string
  seller_id: string
  role: "coordinator" | "producer" | "hub"
  commission_rate: number | null
  is_active: boolean
  joined_at: Date
  metadata: Record<string, unknown> | null
}

class OrderCycleModuleService extends MedusaService({
  OrderCycle,
  OrderCycleProduct,
  OrderCycleSeller,
}) {
  /**
   * Get active order cycles (currently open for ordering)
   */
  async getActiveOrderCycles(sellerId?: string): Promise<InferredOrderCycle[]> {
    const now = new Date()
    
    const filters: Record<string, unknown> = {
      status: "open",
      opens_at: { $lte: now },
      closes_at: { $gte: now },
    }
    
    if (sellerId) {
      // Get cycles where this seller is a participant
      const sellerCycles = await this.listOrderCycleSellers({
        seller_id: sellerId,
        is_active: true,
      })
      
      const cycleIds = sellerCycles.map((sc) => sc.id)
      if (cycleIds.length === 0) return []
      
      filters.id = cycleIds
    }
    
    return this.listOrderCycles(filters) as Promise<InferredOrderCycle[]>
  }

  /**
   * Get upcoming order cycles (scheduled but not yet open)
   */
  async getUpcomingOrderCycles(sellerId?: string, limit = 10): Promise<InferredOrderCycle[]> {
    const now = new Date()
    
    const filters: Record<string, unknown> = {
      status: ["draft", "upcoming"],
      opens_at: { $gt: now },
    }
    
    if (sellerId) {
      const sellerCycles = await this.listOrderCycleSellers({
        seller_id: sellerId,
        is_active: true,
      })
      
      const cycleIds = sellerCycles.map((sc) => sc.id)
      if (cycleIds.length === 0) return []
      
      filters.id = cycleIds
    }
    
    return this.listOrderCycles(filters, {
      order: { opens_at: "ASC" },
      take: limit,
    }) as Promise<InferredOrderCycle[]>
  }

  /**
   * Automatically update order cycle statuses based on time
   * Call this from a scheduled job
   */
  async updateOrderCycleStatuses(): Promise<{ opened: number; closed: number }> {
    const now = new Date()
    const results = {
      opened: 0,
      closed: 0,
    }
    
    // Move upcoming cycles to open
    const toOpen = await this.listOrderCycles({
      status: ["draft", "upcoming"],
      opens_at: { $lte: now },
      closes_at: { $gt: now },
    })
    
    for (const cycle of toOpen) {
      await this.updateOrderCycles({ id: cycle.id, status: "open" })
      results.opened++
    }
    
    // Move open cycles to closed
    const toClose = await this.listOrderCycles({
      status: "open",
      closes_at: { $lte: now },
    })
    
    for (const cycle of toClose) {
      await this.updateOrderCycles({ id: cycle.id, status: "closed" })
      results.closed++
    }
    
    return results
  }

  /**
   * Add a product to an order cycle
   */
  async addProductToOrderCycle(
    orderCycleId: string,
    variantId: string,
    sellerId: string,
    data?: {
      available_quantity?: number
      price_override?: number
      is_visible?: boolean
      display_order?: number
    }
  ) {
    // Check if product already exists in cycle
    const existing = await this.listOrderCycleProducts({
      order_cycle_id: orderCycleId,
      variant_id: variantId,
    })
    
    if (existing.length > 0) {
      // Update existing
      return this.updateOrderCycleProducts({ 
        id: existing[0].id, 
        ...data 
      })
    }
    
    // Create new
    return this.createOrderCycleProducts({
      order_cycle_id: orderCycleId,
      variant_id: variantId,
      seller_id: sellerId,
      ...data,
    })
  }

  /**
   * Add a seller to an order cycle
   */
  async addSellerToOrderCycle(
    orderCycleId: string,
    sellerId: string,
    role: "coordinator" | "producer" | "hub" = "producer",
    commissionRate?: number
  ) {
    // Check if seller already in cycle
    const existing = await this.listOrderCycleSellers({
      order_cycle_id: orderCycleId,
      seller_id: sellerId,
    })
    
    if (existing.length > 0) {
      return this.updateOrderCycleSellers({ 
        id: existing[0].id,
        role,
        commission_rate: commissionRate,
        is_active: true,
      })
    }
    
    return this.createOrderCycleSellers({
      order_cycle_id: orderCycleId,
      seller_id: sellerId,
      role,
      commission_rate: commissionRate,
    })
  }

  /**
   * Get products available in an order cycle
   * Returns products with their cycle-specific overrides
   */
  async getOrderCycleProducts(orderCycleId: string, onlyVisible = true) {
    const filters: Record<string, unknown> = {
      order_cycle_id: orderCycleId,
    }
    
    if (onlyVisible) {
      filters.is_visible = true
    }
    
    return this.listOrderCycleProducts(filters, {
      order: { display_order: "ASC" },
    })
  }

  /**
   * Get sellers participating in an order cycle
   */
  async getOrderCycleSellers(orderCycleId: string, onlyActive = true) {
    const filters: Record<string, unknown> = {
      order_cycle_id: orderCycleId,
    }
    
    if (onlyActive) {
      filters.is_active = true
    }
    
    return this.listOrderCycleSellers(filters)
  }

  /**
   * Check if a product variant is available for ordering
   * Validates: cycle is open, product is visible, quantity available
   */
  async checkProductAvailability(
    orderCycleId: string,
    variantId: string,
    requestedQuantity: number
  ): Promise<{
    available: boolean
    reason?: string
    maxQuantity?: number
  }> {
    // Check cycle status
    const cycle = await this.retrieveOrderCycle(orderCycleId)
    
    if (cycle.status !== "open") {
      return {
        available: false,
        reason: `Order cycle is ${cycle.status}, not accepting orders`,
      }
    }
    
    // Check product in cycle
    const products = await this.listOrderCycleProducts({
      order_cycle_id: orderCycleId,
      variant_id: variantId,
    })
    
    if (products.length === 0) {
      return {
        available: false,
        reason: "Product not available in this order cycle",
      }
    }
    
    const cycleProduct = products[0]
    
    if (!cycleProduct.is_visible) {
      return {
        available: false,
        reason: "Product is not currently visible",
      }
    }
    
    // Check quantity
    if (cycleProduct.available_quantity !== null) {
      const remaining = cycleProduct.available_quantity - cycleProduct.sold_quantity
      
      if (remaining < requestedQuantity) {
        return {
          available: false,
          reason: `Only ${remaining} units available`,
          maxQuantity: remaining,
        }
      }
    }
    
    return { available: true }
  }

  /**
   * Record a sale against an order cycle product
   * Called when an order is placed
   */
  async recordSale(
    orderCycleId: string,
    variantId: string,
    quantity: number
  ) {
    const products = await this.listOrderCycleProducts({
      order_cycle_id: orderCycleId,
      variant_id: variantId,
    })
    
    if (products.length === 0) {
      throw new Error("Product not found in order cycle")
    }
    
    const product = products[0]
    
    return this.updateOrderCycleProducts({
      id: product.id,
      sold_quantity: product.sold_quantity + quantity,
    })
  }

  /**
   * Clone an order cycle (for recurring cycles)
   */
  async cloneOrderCycle(
    sourceOrderCycleId: string,
    newDates: {
      opens_at: Date
      closes_at: Date
      dispatch_at: Date
    }
  ) {
    const source = await this.retrieveOrderCycle(sourceOrderCycleId)
    
    // Get products and sellers separately
    const sourceProducts = await this.listOrderCycleProducts({
      order_cycle_id: sourceOrderCycleId,
    })
    
    const sourceSellers = await this.listOrderCycleSellers({
      order_cycle_id: sourceOrderCycleId,
    })
    
    // Create new cycle
    const newCycle = await this.createOrderCycles({
      name: source.name,
      description: source.description,
      opens_at: newDates.opens_at,
      closes_at: newDates.closes_at,
      dispatch_at: newDates.dispatch_at,
      status: "draft",
      coordinator_seller_id: source.coordinator_seller_id,
      is_recurring: source.is_recurring,
      recurrence_rule: source.recurrence_rule,
      pickup_instructions: source.pickup_instructions,
      pickup_location: source.pickup_location,
    })
    
    // Clone products (reset sold quantities)
    for (const product of sourceProducts) {
      await this.createOrderCycleProducts({
        order_cycle_id: newCycle.id,
        variant_id: product.variant_id,
        seller_id: product.seller_id,
        available_quantity: product.available_quantity,
        price_override: product.price_override,
        is_visible: product.is_visible,
        display_order: product.display_order,
        sold_quantity: 0, // Reset
      })
    }
    
    // Clone sellers
    for (const seller of sourceSellers) {
      await this.createOrderCycleSellers({
        order_cycle_id: newCycle.id,
        seller_id: seller.seller_id,
        role: seller.role,
        commission_rate: seller.commission_rate,
        is_active: seller.is_active,
      })
    }
    
    return newCycle
  }
}

export default OrderCycleModuleService
