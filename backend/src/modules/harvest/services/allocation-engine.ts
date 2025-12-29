import { MedusaService } from "@medusajs/framework/utils"

/**
 * Harvest Allocation Engine
 * 
 * Calculates and manages the distribution of harvest value
 * across different pools and members.
 */

export interface AllocationPool {
  type: PoolType
  percentage: number
  amount: number
  distributed: boolean
}

export type PoolType = 
  | "investor"      // Distributed to investors by investment amount
  | "volunteer"     // Distributed to volunteers by hours worked
  | "plot_holder"   // Distributed to plot holders by plot size
  | "communal"      // Equal share to all members
  | "open_market"   // Sold at market, revenue to garden
  | "donation"      // Donated to food banks, community

export interface MemberContributions {
  customer_id: string
  membership_id: string
  labor_hours: number
  investment_amount: number
  plot_area_sqft: number
  is_active: boolean
}

export interface AllocationResult {
  customer_id: string
  membership_id: string
  pool_type: PoolType
  share_percentage: number
  allocated_value: number
  allocated_quantity?: number
  claim_status: "pending" | "claimed" | "expired" | "donated"
}

export interface HarvestData {
  harvest_id: string
  crop_type: string
  quantity: number
  unit: string
  quality_grade: string
  estimated_value: number
  harvested_at: Date
}

/**
 * Harvest Allocation Engine
 * 
 * Handles the complex logic of distributing harvest value
 * fairly across all stakeholder groups.
 */
export class HarvestAllocationEngine extends MedusaService({}) {

  /**
   * Calculate full allocation for a harvest
   */
  static allocateHarvest(
    harvest: HarvestData,
    allocationRules: { pool_type: PoolType; percentage: number }[],
    members: MemberContributions[]
  ): {
    pools: AllocationPool[]
    memberAllocations: AllocationResult[]
    summary: {
      total_value: number
      total_members: number
      distributed_value: number
      market_value: number
      donation_value: number
    }
  } {
    const totalValue = harvest.estimated_value
    const activeMembers = members.filter(m => m.is_active)
    
    // Calculate pool amounts
    const pools: AllocationPool[] = allocationRules.map(rule => ({
      type: rule.pool_type as PoolType,
      percentage: rule.percentage,
      amount: Math.round((totalValue * rule.percentage / 100) * 100) / 100,
      distributed: false
    }))

    // Calculate totals for proportional distribution
    const totals = {
      labor_hours: activeMembers.reduce((sum, m) => sum + m.labor_hours, 0),
      investment: activeMembers.reduce((sum, m) => sum + m.investment_amount, 0),
      plot_area: activeMembers.reduce((sum, m) => sum + m.plot_area_sqft, 0),
      members: activeMembers.length
    }

    // Distribute to members
    const memberAllocations: AllocationResult[] = []
    
    for (const pool of pools) {
      // Skip pools that don't go to members
      if (pool.type === "open_market" || pool.type === "donation") {
        continue
      }

      for (const member of activeMembers) {
        const result = this.calculateMemberShare(pool, member, totals)
        if (result.allocated_value > 0) {
          memberAllocations.push({
            customer_id: member.customer_id,
            membership_id: member.membership_id,
            pool_type: pool.type,
            share_percentage: result.share_percentage,
            allocated_value: result.allocated_value,
            claim_status: "pending"
          })
        }
      }
      
      pool.distributed = true
    }

    // Calculate summary
    const marketPool = pools.find(p => p.type === "open_market")
    const donationPool = pools.find(p => p.type === "donation")
    const distributedValue = memberAllocations.reduce((sum, a) => sum + a.allocated_value, 0)

    return {
      pools,
      memberAllocations,
      summary: {
        total_value: totalValue,
        total_members: activeMembers.length,
        distributed_value: distributedValue,
        market_value: marketPool?.amount || 0,
        donation_value: donationPool?.amount || 0
      }
    }
  }

  /**
   * Calculate a single member's share from a pool
   */
  private static calculateMemberShare(
    pool: AllocationPool,
    member: MemberContributions,
    totals: {
      labor_hours: number
      investment: number
      plot_area: number
      members: number
    }
  ): { share_percentage: number; allocated_value: number } {
    let sharePercentage = 0

    switch (pool.type) {
      case "volunteer":
        if (totals.labor_hours > 0) {
          sharePercentage = (member.labor_hours / totals.labor_hours) * 100
        }
        break

      case "investor":
        if (totals.investment > 0) {
          sharePercentage = (member.investment_amount / totals.investment) * 100
        }
        break

      case "plot_holder":
        if (totals.plot_area > 0) {
          sharePercentage = (member.plot_area_sqft / totals.plot_area) * 100
        }
        break

      case "communal":
        if (totals.members > 0) {
          sharePercentage = 100 / totals.members
        }
        break
    }

    const allocatedValue = Math.round((pool.amount * sharePercentage / 100) * 100) / 100

    return { share_percentage: sharePercentage, allocated_value: allocatedValue }
  }

  /**
   * Aggregate member allocations across multiple harvests
   */
  static aggregateMemberAllocations(
    allocations: AllocationResult[]
  ): Map<string, {
    customer_id: string
    total_value: number
    by_pool: Record<PoolType, number>
    allocation_count: number
  }> {
    const aggregated = new Map<string, {
      customer_id: string
      total_value: number
      by_pool: Record<PoolType, number>
      allocation_count: number
    }>()

    for (const alloc of allocations) {
      const existing = aggregated.get(alloc.customer_id) || {
        customer_id: alloc.customer_id,
        total_value: 0,
        by_pool: {
          investor: 0,
          volunteer: 0,
          plot_holder: 0,
          communal: 0,
          open_market: 0,
          donation: 0
        },
        allocation_count: 0
      }

      existing.total_value += alloc.allocated_value
      existing.by_pool[alloc.pool_type] += alloc.allocated_value
      existing.allocation_count++

      aggregated.set(alloc.customer_id, existing)
    }

    return aggregated
  }

  /**
   * Apply quality grade multiplier to harvest value
   */
  static applyQualityMultiplier(baseValue: number, qualityGrade: string): number {
    const multipliers: Record<string, number> = {
      premium: 1.3,
      standard: 1.0,
      seconds: 0.7,
      processing: 0.4
    }
    
    return baseValue * (multipliers[qualityGrade] || 1.0)
  }

  /**
   * Calculate fair market value based on crop and quantity
   */
  static estimateHarvestValue(
    cropType: string,
    quantity: number,
    unit: string,
    qualityGrade: string,
    pricePerUnit: number
  ): number {
    const baseValue = quantity * pricePerUnit
    return this.applyQualityMultiplier(baseValue, qualityGrade)
  }

  /**
   * Generate claim expiration dates based on pool type
   */
  static getClaimDeadline(pool_type: PoolType, harvestDate: Date): Date {
    const deadlines: Record<PoolType, number> = {
      investor: 14,      // 14 days
      volunteer: 14,
      plot_holder: 14,
      communal: 7,       // 7 days
      open_market: 0,    // Immediate
      donation: 0
    }
    
    const deadline = new Date(harvestDate)
    deadline.setDate(deadline.getDate() + (deadlines[pool_type] || 7))
    return deadline
  }
}

export default HarvestAllocationEngine
