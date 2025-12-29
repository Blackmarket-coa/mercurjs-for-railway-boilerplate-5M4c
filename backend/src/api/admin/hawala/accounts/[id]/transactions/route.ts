import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../../../modules/hawala-ledger/service"

/**
 * GET /admin/hawala/accounts/:id/transactions
 * Get transaction history for an account
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)
  const { id } = req.params
  const { limit = "50", offset = "0", entry_type } = req.query

  try {
    const transactions = await hawalaService.getTransactionHistory(id, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      entry_type: entry_type as string,
    })

    res.json({
      transactions,
      count: transactions.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
