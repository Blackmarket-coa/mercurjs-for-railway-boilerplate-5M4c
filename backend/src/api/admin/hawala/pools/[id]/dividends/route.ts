import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../../modules/hawala-ledger/service"

/**
 * POST /admin/hawala/pools/:id/dividends
 * Distribute dividends to pool investors
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)
  const { id } = req.params

  const { amount, description } = req.body as {
    amount: number
    description?: string
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" })
  }

  try {
    const distributions = await hawalaService.distributeDividends({
      pool_id: id,
      total_amount: amount,
    })

    res.json({
      success: true,
      total_distributed: amount,
      distributions,
      description,
    })
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
}
