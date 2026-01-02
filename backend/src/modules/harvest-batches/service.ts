import { MedusaService } from "@medusajs/framework/utils"
import { 
  HarvestBatch, 
  BatchReservation, 
  SeasonalProduct,
  BatchStatus,
  SeasonTag,
} from "./models"

/**
 * Scarcity Level
 */
export type ScarcityLevel = "abundant" | "available" | "limited" | "scarce" | "sold_out"

/**
 * Availability Info for display
 */
export interface AvailabilityInfo {
  available: boolean
  quantity_remaining: number
  scarcity_level: ScarcityLevel
  scarcity_message?: string
  best_by?: Date
  harvest_date?: Date
  origin?: string
  seasonal_info?: {
    is_in_season: boolean
    peak_season: boolean
    available_months: number[]
    next_available?: Date
  }
  preorder_info?: {
    available: boolean
    expected_date?: Date
    discount_percent?: number
  }
}

class HarvestBatchesService extends MedusaService({
  HarvestBatch,
  BatchReservation,
  SeasonalProduct,
}) {
  /**
   * Create a new harvest batch
   */
  async createBatch(data: {
    product_variant_id: string
    seller_id: string
    batch_code: string
    total_quantity: number
    unit?: string
    harvested_at?: Date
    available_from?: Date
    available_until?: Date
    best_by?: Date
    season_tags?: SeasonTag[]
    harvest_story?: string
    origin_location?: string
    batch_photos?: string[]
    batch_price?: number
    preorder_discount_percent?: number
    low_stock_threshold?: number
  }) {
    const now = new Date()
    let status = BatchStatus.PLANNED
    
    if (data.available_from) {
      if (new Date(data.available_from) <= now) {
        status = BatchStatus.AVAILABLE
      }
    } else {
      status = BatchStatus.AVAILABLE
    }
    
    return this.createHarvestBatches({
      product_variant_id: data.product_variant_id,
      seller_id: data.seller_id,
      batch_code: data.batch_code,
      total_quantity: data.total_quantity,
      unit: data.unit,
      harvested_at: data.harvested_at,
      available_from: data.available_from,
      available_until: data.available_until,
      best_by: data.best_by,
      season_tags: data.season_tags as unknown as Record<string, unknown>,
      harvest_story: data.harvest_story,
      origin_location: data.origin_location,
      batch_photos: data.batch_photos as unknown as Record<string, unknown>,
      batch_price: data.batch_price,
      preorder_discount_percent: data.preorder_discount_percent,
      low_stock_threshold: data.low_stock_threshold,
      status,
      sold_quantity: 0,
      reserved_quantity: 0,
    })
  }
  
  /**
   * Get available batches for a product variant
   */
  async getAvailableBatches(
    productVariantId: string
  ) {
    return this.listHarvestBatches({
      product_variant_id: productVariantId,
      status: [BatchStatus.AVAILABLE, BatchStatus.LOW_STOCK],
    })
  }
  
  /**
   * Get availability info for a product variant
   */
  async getAvailabilityInfo(productVariantId: string): Promise<AvailabilityInfo> {
    const batches = await this.getAvailableBatches(productVariantId)
    const seasonalProducts = await this.listSeasonalProducts({
      // Would need product ID lookup here
    })
    
    // Calculate total remaining
    let totalRemaining = 0
    let nearestBestBy: Date | undefined
    let harvestDate: Date | undefined
    let origin: string | undefined
    
    for (const batch of batches) {
      const remaining = batch.total_quantity - batch.sold_quantity - batch.reserved_quantity
      totalRemaining += remaining
      
      if (batch.best_by) {
        if (!nearestBestBy || new Date(batch.best_by) < nearestBestBy) {
          nearestBestBy = new Date(batch.best_by)
        }
      }
      
      if (batch.harvested_at && !harvestDate) {
        harvestDate = new Date(batch.harvested_at)
      }
      
      if (batch.origin_location && !origin) {
        origin = batch.origin_location
      }
    }
    
    // Determine scarcity level
    let scarcityLevel: ScarcityLevel = "sold_out"
    let scarcityMessage: string | undefined
    
    if (totalRemaining === 0) {
      scarcityLevel = "sold_out"
      scarcityMessage = "Sold out"
    } else if (totalRemaining <= 3) {
      scarcityLevel = "scarce"
      scarcityMessage = `Only ${totalRemaining} left!`
    } else if (totalRemaining <= 10) {
      scarcityLevel = "limited"
      scarcityMessage = `Limited quantity - ${totalRemaining} remaining`
    } else if (totalRemaining <= 25) {
      scarcityLevel = "available"
    } else {
      scarcityLevel = "abundant"
    }
    
    // Seasonal info
    const currentMonth = new Date().getMonth() + 1
    let seasonalInfo: AvailabilityInfo["seasonal_info"]
    let preorderInfo: AvailabilityInfo["preorder_info"]
    
    if (seasonalProducts.length > 0) {
      const seasonal = seasonalProducts[0]
      const availableMonthsRaw = seasonal.available_months as Record<string, unknown> | null
      const peakMonthsRaw = seasonal.peak_months as Record<string, unknown> | null
      const availableMonths: number[] = Array.isArray(availableMonthsRaw) 
        ? (availableMonthsRaw as unknown as number[]) 
        : []
      const peakMonths: number[] = Array.isArray(peakMonthsRaw)
        ? (peakMonthsRaw as unknown as number[])
        : []
      const isInSeason = availableMonths.includes(currentMonth)
      const isPeakSeason = peakMonths.includes(currentMonth)
      
      seasonalInfo = {
        is_in_season: isInSeason,
        peak_season: isPeakSeason,
        available_months: availableMonths,
      }
      
      if (!isInSeason && seasonal.allow_preorder) {
        // Find next available month
        const sortedMonths = [...availableMonths].sort((a, b) => a - b)
        const nextMonth = sortedMonths.find(m => m > currentMonth) || sortedMonths[0]
        const nextYear = nextMonth <= currentMonth ? new Date().getFullYear() + 1 : new Date().getFullYear()
        
        preorderInfo = {
          available: true,
          expected_date: new Date(nextYear, nextMonth - 1, 1),
          discount_percent: 0, // Would get from batch
        }
      }
    }
    
    return {
      available: totalRemaining > 0,
      quantity_remaining: totalRemaining,
      scarcity_level: scarcityLevel,
      scarcity_message: scarcityMessage,
      best_by: nearestBestBy,
      harvest_date: harvestDate,
      origin,
      seasonal_info: seasonalInfo,
      preorder_info: preorderInfo,
    }
  }
  
  /**
   * Reserve quantity from a batch
   */
  async reserveQuantity(
    batchId: string,
    quantity: number,
    options: {
      customer_id?: string
      cart_id?: string
      session_id?: string
      expires_minutes?: number
    }
  ) {
    const batch = await this.retrieveHarvestBatch(batchId)
    
    const available = batch.total_quantity - batch.sold_quantity - batch.reserved_quantity
    if (available < quantity) {
      return null
    }
    
    // Create reservation
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + (options.expires_minutes || 30))
    
    const reservation = await this.createBatchReservations({
      harvest_batch_id: batchId,
      customer_id: options.customer_id,
      cart_id: options.cart_id,
      session_id: options.session_id,
      quantity,
      expires_at: expiresAt,
    })
    
    // Update batch reserved quantity
    await this.updateHarvestBatches({
      id: batchId,
      reserved_quantity: batch.reserved_quantity + quantity,
    })
    
    // Update status if needed
    await this.updateBatchStatus(batchId)
    
    return reservation
  }
  
  /**
   * Convert reservation to order (when checkout completes)
   */
  async convertReservationToOrder(
    reservationId: string,
    orderId: string
  ): Promise<void> {
    const reservation = await this.retrieveBatchReservation(reservationId)
    
    if (reservation.converted_to_order) {
      return // Already converted
    }
    
    const batch = await this.retrieveHarvestBatch(reservation.harvest_batch_id)
    
    // Update reservation
    await this.updateBatchReservations({
      id: reservationId,
      converted_to_order: true,
      order_id: orderId,
    })
    
    // Move from reserved to sold
    await this.updateHarvestBatches({
      id: batch.id,
      reserved_quantity: Math.max(0, batch.reserved_quantity - reservation.quantity),
      sold_quantity: batch.sold_quantity + reservation.quantity,
    })
    
    // Update status
    await this.updateBatchStatus(batch.id)
  }
  
  /**
   * Release expired reservations
   */
  async releaseExpiredReservations(): Promise<number> {
    const now = new Date()
    const expiredReservations = await this.listBatchReservations({
      converted_to_order: false,
      // expires_at < now - would need custom query
    })
    
    let releasedCount = 0
    
    for (const reservation of expiredReservations) {
      if (new Date(reservation.expires_at) < now) {
        const batch = await this.retrieveHarvestBatch(reservation.harvest_batch_id)
        
        // Release reserved quantity
        await this.updateHarvestBatches({
          id: batch.id,
          reserved_quantity: Math.max(0, batch.reserved_quantity - reservation.quantity),
        })
        
        // Delete reservation
        await this.deleteBatchReservations(reservation.id)
        
        // Update status
        await this.updateBatchStatus(batch.id)
        
        releasedCount++
      }
    }
    
    return releasedCount
  }
  
  /**
   * Update batch status based on quantities
   */
  async updateBatchStatus(batchId: string): Promise<BatchStatus> {
    const batch = await this.retrieveHarvestBatch(batchId)
    const remaining = batch.total_quantity - batch.sold_quantity
    
    let newStatus = batch.status as BatchStatus
    
    // Check expiration
    if (batch.best_by && new Date(batch.best_by) < new Date()) {
      newStatus = BatchStatus.EXPIRED
    }
    // Check availability window
    else if (batch.available_until && new Date(batch.available_until) < new Date()) {
      newStatus = BatchStatus.SOLD_OUT
    }
    // Check quantity
    else if (remaining <= 0) {
      newStatus = BatchStatus.SOLD_OUT
    } else if (remaining <= batch.low_stock_threshold) {
      newStatus = BatchStatus.LOW_STOCK
    } else if (batch.available_from && new Date(batch.available_from) > new Date()) {
      newStatus = BatchStatus.PLANNED
    } else {
      newStatus = BatchStatus.AVAILABLE
    }
    
    if (newStatus !== batch.status) {
      await this.updateHarvestBatches({
        id: batchId,
        status: newStatus,
      })
    }
    
    return newStatus
  }
  
  /**
   * Get scarcity messaging for display
   */
  getScarcityMessaging(info: AvailabilityInfo): {
    badge?: { text: string; color: string }
    urgency_message?: string
    freshness_message?: string
    seasonal_message?: string
  } {
    const result: ReturnType<HarvestBatchesService["getScarcityMessaging"]> = {}
    
    // Scarcity badge
    switch (info.scarcity_level) {
      case "scarce":
        result.badge = { text: "Almost Gone!", color: "#DC2626" }
        result.urgency_message = `Only ${info.quantity_remaining} left - order soon!`
        break
      case "limited":
        result.badge = { text: "Limited Batch", color: "#F59E0B" }
        result.urgency_message = `Limited quantity available`
        break
      case "sold_out":
        result.badge = { text: "Sold Out", color: "#6B7280" }
        break
    }
    
    // Freshness
    if (info.harvest_date) {
      const daysSinceHarvest = Math.floor(
        (Date.now() - info.harvest_date.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceHarvest <= 1) {
        result.freshness_message = "Harvested today!"
      } else if (daysSinceHarvest <= 3) {
        result.freshness_message = `Harvested ${daysSinceHarvest} days ago`
      }
    }
    
    // Seasonal
    if (info.seasonal_info) {
      if (info.seasonal_info.peak_season) {
        result.seasonal_message = "Peak season - best quality!"
      } else if (!info.seasonal_info.is_in_season) {
        result.seasonal_message = "Out of season - check back later"
      }
    }
    
    return result
  }
  
  /**
   * Set up seasonal product tracking
   */
  async setSeasonalProduct(
    productId: string,
    sellerId: string,
    data: {
      available_months: number[]
      peak_months?: number[]
      year_round_with_peaks?: boolean
      seasonal_notes?: string
      allow_preorder?: boolean
      preorder_lead_days?: number
    }
  ) {
    const existing = await this.listSeasonalProducts({
      product_id: productId,
      seller_id: sellerId,
    })
    
    if (existing.length > 0) {
      return this.updateSeasonalProducts({
        id: existing[0].id,
        available_months: data.available_months as unknown as Record<string, unknown>,
        peak_months: data.peak_months as unknown as Record<string, unknown>,
        year_round_with_peaks: data.year_round_with_peaks,
        seasonal_notes: data.seasonal_notes,
        allow_preorder: data.allow_preorder,
        preorder_lead_days: data.preorder_lead_days,
      })
    }
    
    return this.createSeasonalProducts({
      product_id: productId,
      seller_id: sellerId,
      available_months: data.available_months as unknown as Record<string, unknown>,
      peak_months: data.peak_months as unknown as Record<string, unknown>,
      year_round_with_peaks: data.year_round_with_peaks,
      seasonal_notes: data.seasonal_notes,
      allow_preorder: data.allow_preorder,
      preorder_lead_days: data.preorder_lead_days,
    })
  }
  
  /**
   * Add customer to notification list for out-of-season product
   */
  async addToNotificationList(
    productId: string,
    customerId: string
  ): Promise<void> {
    const seasonalProducts = await this.listSeasonalProducts({
      product_id: productId,
    })
    
    if (seasonalProducts.length === 0) return
    
    const seasonal = seasonalProducts[0]
    const notificationListRaw = seasonal.notification_list as Record<string, unknown> | null
    const currentList: string[] = Array.isArray(notificationListRaw)
      ? (notificationListRaw as unknown as string[])
      : []
    
    if (!currentList.includes(customerId)) {
      await this.updateSeasonalProducts({
        id: seasonal.id,
        notification_list: [...currentList, customerId] as unknown as Record<string, unknown>,
      })
    }
  }
}

export default HarvestBatchesService
