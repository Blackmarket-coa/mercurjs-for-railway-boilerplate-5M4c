import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /vendor/hawala/pools
 * Get vendor's producer investment pools
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const sellerId = (req as any).auth_context?.actor_id
  if (!sellerId) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    // Get pools where this seller/producer is the owner
    const pools = await hawalaService.listInvestmentPools({
      filters: { producer_id: sellerId },
    })

    // Get details for each pool
    const poolsWithDetails = await Promise.all(
      pools.map(async (pool) => {
        const balance = await hawalaService.getAccountBalance(pool.ledger_account_id)
        const investments = await hawalaService.listInvestments({
          filters: { pool_id: pool.id },
        })

        const progress = Number(pool.target_amount) > 0
          ? (Number(pool.total_raised) / Number(pool.target_amount)) * 100
          : 0

        return {
          ...pool,
          current_balance: balance.balance,
          progress_percentage: Math.min(progress, 100),
          investments_count: investments.length,
        }
      })
    )

    res.json({ pools: poolsWithDetails })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

/**
 * POST /vendor/hawala/pools
 * Create a new investment pool for the vendor
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const sellerId = (req as any).auth_context?.actor_id
  if (!sellerId) {
    return res.status(401).json({ error: "Authentication required" })
  }

  const {
    name,
    description,
    target_amount,
    minimum_investment,
    roi_type,
    fixed_roi_rate,
    revenue_share_percentage,
    product_credit_multiplier,
    end_date,
    auto_invest_enabled,
    auto_invest_percentage,
  } = req.body as {
    name: string
    description?: string
    target_amount: number
    minimum_investment?: number
    roi_type: string
    fixed_roi_rate?: number
    revenue_share_percentage?: number
    product_credit_multiplier?: number
    end_date?: string
    auto_invest_enabled?: boolean
    auto_invest_percentage?: number
  }

  if (!name || !target_amount || !roi_type) {
    return res.status(400).json({
      error: "name, target_amount, and roi_type are required",
    })
  }

  try {
    // Create ledger account for pool
    const poolAccount = await hawalaService.createAccount({
      account_type: "PRODUCER_POOL",
      owner_type: "PRODUCER",
      owner_id: sellerId,
    })

    // Create investment pool
    const pool = await hawalaService.createInvestmentPools({
      name,
      description,
      producer_id: sellerId,
      ledger_account_id: poolAccount.id,
      target_amount,
      minimum_investment: minimum_investment || 1,
      roi_type: roi_type as "FIXED_RATE" | "REVENUE_SHARE" | "PRODUCT_CREDIT" | "HYBRID",
      fixed_roi_rate,
      revenue_share_percentage,
      product_credit_multiplier,
      start_date: new Date(),
      end_date: end_date ? new Date(end_date) : undefined,
      auto_invest_enabled: auto_invest_enabled || false,
      auto_invest_percentage: auto_invest_percentage || 0,
      status: "ACTIVE",
    })

    res.status(201).json({ pool, account: poolAccount })
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
}
