import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /admin/hawala/transfers
 * List ledger entries/transfers
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const {
    entry_type,
    status,
    order_id,
    limit = "50",
    offset = "0",
  } = req.query

  const filters: Record<string, any> = {}
  if (entry_type) filters.entry_type = entry_type
  if (status) filters.status = status
  if (order_id) filters.order_id = order_id

  const entries = await hawalaService.listLedgerEntries({
    filters,
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
  })

  res.json({
    entries,
    count: entries.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  })
}

/**
 * POST /admin/hawala/transfers
 * Create a manual transfer between accounts
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const {
    debit_account_id,
    credit_account_id,
    amount,
    entry_type,
    description,
    reference_type,
    reference_id,
    idempotency_key,
    metadata,
  } = req.body as {
    debit_account_id: string
    credit_account_id: string
    amount: number
    entry_type: string
    description?: string
    reference_type?: string
    reference_id?: string
    idempotency_key?: string
    metadata?: Record<string, any>
  }

  if (!debit_account_id || !credit_account_id || !amount || !entry_type) {
    return res.status(400).json({
      error: "debit_account_id, credit_account_id, amount, and entry_type are required",
    })
  }

  try {
    const entry = await hawalaService.createTransfer({
      debit_account_id,
      credit_account_id,
      amount,
      entry_type,
      description,
      reference_type,
      reference_id,
      idempotency_key: idempotency_key || `manual-${Date.now()}`,
      metadata,
    })

    res.status(201).json({ entry })
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
}
