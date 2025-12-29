import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /admin/hawala/summary
 * Get ledger summary and statistics
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  try {
    const summary = await hawalaService.getLedgerSummary()

    // Get recent entries
    const recentEntries = await hawalaService.listLedgerEntries({
      take: 10,
    })

    // Get investment pool stats
    const pools = await hawalaService.listInvestmentPools({})
    const totalInvested = pools.reduce((sum, p) => sum + Number(p.total_raised), 0)
    const totalDistributed = pools.reduce((sum, p) => sum + Number(p.total_distributed), 0)

    // Get settlement stats
    const settlements = await hawalaService.listSettlementBatches({})
    const completedSettlements = settlements.filter(s => s.status === "CONFIRMED" || s.status === "COMPLETED")
    const totalSettledVolume = completedSettlements.reduce(
      (sum, s) => sum + Number(s.total_volume),
      0
    )

    res.json({
      accounts: summary,
      investments: {
        total_pools: pools.length,
        total_invested: totalInvested,
        total_distributed: totalDistributed,
      },
      settlements: {
        total_batches: settlements.length,
        completed_batches: completedSettlements.length,
        total_settled_volume: totalSettledVolume,
      },
      recent_entries: recentEntries,
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
