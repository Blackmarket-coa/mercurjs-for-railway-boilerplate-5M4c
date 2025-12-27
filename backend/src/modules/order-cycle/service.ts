import { MedusaService } from "@medusajs/framework/utils"
import { 
  OrderCycle, 
  OrderCycleProduct, 
  OrderCycleSeller,
  OrderCycleExchange,
  OrderCycleFee,
  EnterpriseFee,
} from "./models"

type OrderCycleStatus = "draft" | "upcoming" | "open" | "closed" | "dispatched" | "cancelled"
type FeeType = "admin" | "packing" | "transport" | "fundraising" | "sales" | "coordinator"
type CalculatorType = "flat_rate" | "flat_per_item" | "percentage" | "weight"
type ExchangeType = "incoming" | "outgoing"
type ApplicationType = "coordinator" | "incoming" | "outgoing"

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
  ready_for_text: string | null
  metadata: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  products?: InferredOrderCycleProduct[]
  sellers?: InferredOrderCycleSeller[]
  exchanges?: InferredOrderCycleExchange[]
  fees?: InferredOrderCycleFee[]
}

type InferredOrderCycleProduct = {
  id: string
  order_cycle_id: string
  exchange_id: string | null
  variant_id: string
  seller_id: string
  available_quantity: number | null
  sold_quantity: number
  override_price: number | null
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
  metadata: Record<string, unknown> | null
}

type InferredOrderCycleExchange = {
  id: string
  order_cycle_id: string
  exchange_type: ExchangeType
  seller_id: string
  receiver_id: string | null
  pickup_time: string | null
  pickup_instructions: string | null
  ready_at: Date | null
  tags: string[] | null
  is_active: boolean
  metadata: Record<string, unknown> | null
  products?: InferredOrderCycleProduct[]
}

type InferredEnterpriseFee = {
  id: string
  name: string
  description: string | null
  seller_id: string
  fee_type: FeeType
  calculator_type: CalculatorType
  amount: number
  currency_code: string
  tax_category_id: string | null
  inherits_tax_category: boolean
  is_active: boolean
  metadata: Record<string, unknown> | null
}

type InferredOrderCycleFee = {
  id: string
  order_cycle_id: string
  enterprise_fee_id: string
  application_type: ApplicationType
  target_seller_id: string | null
  display_order: number
  metadata: Record<string, unknown> | null
  enterprise_fee?: InferredEnterpriseFee
}

class OrderCycleModuleService extends MedusaService({
  OrderCycle,
  OrderCycleProduct,
  OrderCycleSeller,
  OrderCycleExchange,
  OrderCycleFee,
  EnterpriseFee,
}) {
  // ==================== ORDER CYCLE METHODS ====================

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
   */
  async updateOrderCycleStatuses(): Promise<{ opened: number; closed: number }> {
    const now = new Date()
    const results = { opened: 0, closed: 0 }

    const toOpen = await this.listOrderCycles({
      status: ["draft", "upcoming"],
      opens_at: { $lte: now },
      closes_at: { $gt: now },
    })

    for (const cycle of toOpen) {
      await this.updateOrderCycles({ id: cycle.id, status: "open" })
      results.opened++
    }

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

  // ==================== EXCHANGE METHODS ====================

  /**
   * Create an incoming exchange (producer supplies products)
   */
  async createIncomingExchange(
    orderCycleId: string,
    producerId: string,
    receiverId: string,
    data?: {
      pickup_time?: string
      pickup_instructions?: string
      tags?: string[]
    }
  ) {
    // Check if exchange already exists
    const existing = await this.listOrderCycleExchanges({
      order_cycle_id: orderCycleId,
      exchange_type: "incoming",
      seller_id: producerId,
    })

    if (existing.length > 0) {
      return this.updateOrderCycleExchanges({
        id: existing[0].id,
        receiver_id: receiverId,
        ...data,
        is_active: true,
      })
    }

    return this.createOrderCycleExchanges({
      order_cycle_id: orderCycleId,
      exchange_type: "incoming",
      seller_id: producerId,
      receiver_id: receiverId,
      ...data,
    })
  }

  /**
   * Create an outgoing exchange (distributor sells products)
   */
  async createOutgoingExchange(
    orderCycleId: string,
    distributorId: string,
    data?: {
      ready_at?: Date
      pickup_time?: string
      pickup_instructions?: string
      tags?: string[]
    }
  ) {
    const existing = await this.listOrderCycleExchanges({
      order_cycle_id: orderCycleId,
      exchange_type: "outgoing",
      seller_id: distributorId,
    })

    if (existing.length > 0) {
      return this.updateOrderCycleExchanges({
        id: existing[0].id,
        ...data,
        is_active: true,
      })
    }

    return this.createOrderCycleExchanges({
      order_cycle_id: orderCycleId,
      exchange_type: "outgoing",
      seller_id: distributorId,
      ...data,
    })
  }

  /**
   * Get all incoming exchanges for an order cycle
   */
  async getIncomingExchanges(orderCycleId: string, onlyActive = true) {
    const filters: Record<string, unknown> = {
      order_cycle_id: orderCycleId,
      exchange_type: "incoming",
    }
    if (onlyActive) filters.is_active = true

    return this.listOrderCycleExchanges(filters)
  }

  /**
   * Get all outgoing exchanges for an order cycle
   */
  async getOutgoingExchanges(orderCycleId: string, onlyActive = true) {
    const filters: Record<string, unknown> = {
      order_cycle_id: orderCycleId,
      exchange_type: "outgoing",
    }
    if (onlyActive) filters.is_active = true

    return this.listOrderCycleExchanges(filters)
  }

  /**
   * Add products to an exchange
   */
  async addProductsToExchange(
    exchangeId: string,
    products: Array<{
      variant_id: string
      seller_id: string
      available_quantity?: number
      override_price?: number
    }>
  ) {
    const exchange = await this.retrieveOrderCycleExchange(exchangeId)
    const results = []

    for (const product of products) {
      const existing = await this.listOrderCycleProducts({
        order_cycle_id: exchange.order_cycle_id,
        variant_id: product.variant_id,
      })

      if (existing.length > 0) {
        const updated = await this.updateOrderCycleProducts({
          id: existing[0].id,
          exchange_id: exchangeId,
          ...product,
        })
        results.push(updated)
      } else {
        const created = await this.createOrderCycleProducts({
          order_cycle_id: exchange.order_cycle_id,
          exchange_id: exchangeId,
          ...product,
        })
        results.push(created)
      }
    }

    return results
  }

  // ==================== ENTERPRISE FEE METHODS ====================

  /**
   * Create an enterprise fee template
   */
  async createFeeTemplate(
    sellerId: string,
    data: {
      name: string
      description?: string
      fee_type: FeeType
      calculator_type: CalculatorType
      amount: number
      currency_code?: string
      tax_category_id?: string
      inherits_tax_category?: boolean
    }
  ) {
    return this.createEnterpriseFees({
      seller_id: sellerId,
      ...data,
    })
  }

  /**
   * Get all fee templates for a seller
   */
  async getSellerFeeTemplates(sellerId: string, onlyActive = true) {
    const filters: Record<string, unknown> = { seller_id: sellerId }
    if (onlyActive) filters.is_active = true

    return this.listEnterpriseFees(filters)
  }

  /**
   * Apply a fee to an order cycle
   */
  async applyFeeToOrderCycle(
    orderCycleId: string,
    enterpriseFeeId: string,
    applicationType: ApplicationType,
    targetSellerId?: string
  ) {
    // Validate: incoming/outgoing requires target seller
    if ((applicationType === "incoming" || applicationType === "outgoing") && !targetSellerId) {
      throw new Error(`${applicationType} fees require a target seller ID`)
    }

    const existing = await this.listOrderCycleFees({
      order_cycle_id: orderCycleId,
      enterprise_fee_id: enterpriseFeeId,
      application_type: applicationType,
      target_seller_id: targetSellerId || null,
    })

    if (existing.length > 0) {
      return existing[0]
    }

    return this.createOrderCycleFees({
      order_cycle_id: orderCycleId,
      enterprise_fee_id: enterpriseFeeId,
      application_type: applicationType,
      target_seller_id: targetSellerId,
    })
  }

  /**
   * Get all fees for an order cycle
   */
  async getOrderCycleFees(orderCycleId: string, applicationType?: ApplicationType) {
    const filters: Record<string, unknown> = { order_cycle_id: orderCycleId }
    if (applicationType) filters.application_type = applicationType

    return this.listOrderCycleFees(filters)
  }

  /**
   * Calculate total fees for an order cycle product
   * Returns the calculated fee amounts based on product price and quantity
   */
  async calculateFeesForProduct(
    orderCycleId: string,
    variantId: string,
    productPrice: number, // in cents
    quantity: number,
    weight?: number // in kg, for weight-based fees
  ): Promise<{
    coordinator_fees: number
    incoming_fees: number
    outgoing_fees: number
    total_fees: number
    fee_breakdown: Array<{
      fee_id: string
      fee_name: string
      fee_type: FeeType
      application_type: ApplicationType
      amount: number
    }>
  }> {
    const product = await this.listOrderCycleProducts({
      order_cycle_id: orderCycleId,
      variant_id: variantId,
    })

    if (product.length === 0) {
      throw new Error("Product not found in order cycle")
    }

    const sellerId = product[0].seller_id
    const fees = await this.listOrderCycleFees({
      order_cycle_id: orderCycleId,
    })

    let coordinatorFees = 0
    let incomingFees = 0
    let outgoingFees = 0
    const feeBreakdown: Array<{
      fee_id: string
      fee_name: string
      fee_type: FeeType
      application_type: ApplicationType
      amount: number
    }> = []

    for (const ocFee of fees) {
      // Skip fees for other sellers
      if (ocFee.application_type !== "coordinator" && ocFee.target_seller_id !== sellerId) {
        continue
      }

      const fee = await this.retrieveEnterpriseFee(ocFee.enterprise_fee_id)
      let feeAmount = 0

      switch (fee.calculator_type) {
        case "flat_rate":
          feeAmount = Number(fee.amount)
          break
        case "flat_per_item":
          feeAmount = Number(fee.amount) * quantity
          break
        case "percentage":
          // Amount is in basis points (100 = 1%)
          feeAmount = Math.round((productPrice * quantity * Number(fee.amount)) / 10000)
          break
        case "weight":
          if (weight) {
            feeAmount = Math.round(Number(fee.amount) * weight * quantity)
          }
          break
      }

      feeBreakdown.push({
        fee_id: fee.id,
        fee_name: fee.name,
        fee_type: fee.fee_type as FeeType,
        application_type: ocFee.application_type as ApplicationType,
        amount: feeAmount,
      })

      switch (ocFee.application_type) {
        case "coordinator":
          coordinatorFees += feeAmount
          break
        case "incoming":
          incomingFees += feeAmount
          break
        case "outgoing":
          outgoingFees += feeAmount
          break
      }
    }

    return {
      coordinator_fees: coordinatorFees,
      incoming_fees: incomingFees,
      outgoing_fees: outgoingFees,
      total_fees: coordinatorFees + incomingFees + outgoingFees,
      fee_breakdown: feeBreakdown,
    }
  }

  // ==================== PRODUCT METHODS ====================

  /**
   * Add a product to an order cycle
   */
  async addProductToOrderCycle(
    orderCycleId: string,
    variantId: string,
    sellerId: string,
    data?: {
      exchange_id?: string
      available_quantity?: number
      override_price?: number
      is_visible?: boolean
      display_order?: number
    }
  ) {
    const existing = await this.listOrderCycleProducts({
      order_cycle_id: orderCycleId,
      variant_id: variantId,
    })

    if (existing.length > 0) {
      return this.updateOrderCycleProducts({
        id: existing[0].id,
        ...data,
      })
    }

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
   */
  async getOrderCycleProducts(orderCycleId: string, onlyVisible = true) {
    const filters: Record<string, unknown> = { order_cycle_id: orderCycleId }
    if (onlyVisible) filters.is_visible = true

    return this.listOrderCycleProducts(filters, {
      order: { display_order: "ASC" },
    })
  }

  /**
   * Get sellers participating in an order cycle
   */
  async getOrderCycleSellers(orderCycleId: string, onlyActive = true) {
    const filters: Record<string, unknown> = { order_cycle_id: orderCycleId }
    if (onlyActive) filters.is_active = true

    return this.listOrderCycleSellers(filters)
  }

  /**
   * Check if a product variant is available for ordering
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
    const cycle = await this.retrieveOrderCycle(orderCycleId)

    if (cycle.status !== "open") {
      return {
        available: false,
        reason: `Order cycle is ${cycle.status}, not accepting orders`,
      }
    }

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
   */
  async recordSale(orderCycleId: string, variantId: string, quantity: number) {
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

    const sourceProducts = await this.listOrderCycleProducts({
      order_cycle_id: sourceOrderCycleId,
    })

    const sourceSellers = await this.listOrderCycleSellers({
      order_cycle_id: sourceOrderCycleId,
    })

    const sourceExchanges = await this.listOrderCycleExchanges({
      order_cycle_id: sourceOrderCycleId,
    })

    const sourceFees = await this.listOrderCycleFees({
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
      ready_for_text: source.ready_for_text,
    })

    // Map old exchange IDs to new ones
    const exchangeIdMap = new Map<string, string>()

    // Clone exchanges
    for (const exchange of sourceExchanges) {
      const newExchange = await this.createOrderCycleExchanges({
        order_cycle_id: newCycle.id,
        exchange_type: exchange.exchange_type,
        seller_id: exchange.seller_id,
        receiver_id: exchange.receiver_id,
        pickup_time: exchange.pickup_time,
        pickup_instructions: exchange.pickup_instructions,
        ready_at: exchange.ready_at,
        tags: exchange.tags,
        is_active: exchange.is_active,
      })
      exchangeIdMap.set(exchange.id, newExchange.id)
    }

    // Clone products (reset sold quantities)
    for (const product of sourceProducts) {
      await this.createOrderCycleProducts({
        order_cycle_id: newCycle.id,
        exchange_id: product.exchange_id ? exchangeIdMap.get(product.exchange_id) : null,
        variant_id: product.variant_id,
        seller_id: product.seller_id,
        available_quantity: product.available_quantity,
        override_price: product.override_price,
        is_visible: product.is_visible,
        display_order: product.display_order,
        sold_quantity: 0,
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

    // Clone fees
    for (const fee of sourceFees) {
      await this.createOrderCycleFees({
        order_cycle_id: newCycle.id,
        enterprise_fee_id: fee.enterprise_fee_id,
        application_type: fee.application_type,
        target_seller_id: fee.target_seller_id,
        display_order: fee.display_order,
      })
    }

    return newCycle
  }
}

export default OrderCycleModuleService
