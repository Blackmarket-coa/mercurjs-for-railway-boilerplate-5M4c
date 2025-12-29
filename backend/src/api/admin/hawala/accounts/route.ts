import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /admin/hawala/accounts
 * List all ledger accounts with filters
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const {
    account_type,
    owner_type,
    owner_id,
    status,
    limit = "50",
    offset = "0",
  } = req.query

  const filters: Record<string, any> = {}
  if (account_type) filters.account_type = account_type
  if (owner_type) filters.owner_type = owner_type
  if (owner_id) filters.owner_id = owner_id
  if (status) filters.status = status

  const accounts = await hawalaService.listLedgerAccounts({
    filters,
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
  })

  res.json({
    accounts,
    count: accounts.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  })
}

/**
 * POST /admin/hawala/accounts
 * Create a new ledger account
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const {
    account_type,
    currency_code,
    owner_type,
    owner_id,
    stellar_address,
    metadata,
  } = req.body as {
    account_type: string
    currency_code?: string
    owner_type?: string
    owner_id?: string
    stellar_address?: string
    metadata?: Record<string, any>
  }

  if (!account_type) {
    return res.status(400).json({ error: "account_type is required" })
  }

  const account = await hawalaService.createAccount({
    account_type,
    currency_code,
    owner_type,
    owner_id,
    stellar_address,
    metadata,
  })

  res.status(201).json({ account })
}
