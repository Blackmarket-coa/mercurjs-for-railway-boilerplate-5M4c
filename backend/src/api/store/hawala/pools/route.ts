import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /store/hawala/pools
 * List available investment pools for customers
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const { producer_id, limit = "50", offset = "0" } = req.query

  try {
    const filters: Record<string, any> = { status: "ACTIVE" }
    if (producer_id) filters.producer_id = producer_id

    const pools = await hawalaService.listInvestmentPools({
      filters,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    })

    // Get balance and progress for each pool
    const poolsWithProgress = await Promise.all(
      pools.map(async (pool) => {
        const balance = await hawalaService.getAccountBalance(pool.ledger_account_id)
        const progress = Number(pool.target_amount) > 0
          ? (Number(pool.total_raised) / Number(pool.target_amount)) * 100
          : 0

        return {
          id: pool.id,
          name: pool.name,
          description: pool.description,
          producer_id: pool.producer_id,
          target_amount: Number(pool.target_amount),
          total_raised: Number(pool.total_raised),
          minimum_investment: Number(pool.minimum_investment),
          roi_type: pool.roi_type,
          fixed_roi_rate: pool.fixed_roi_rate,
          revenue_share_percentage: pool.revenue_share_percentage,
          product_credit_multiplier: pool.product_credit_multiplier,
          total_investors: pool.total_investors,
          progress_percentage: Math.min(progress, 100),
          current_balance: balance.balance,
          start_date: pool.start_date,
          end_date: pool.end_date,
        }
      })
    )

    res.json({
      pools: poolsWithProgress,
      count: poolsWithProgress.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
