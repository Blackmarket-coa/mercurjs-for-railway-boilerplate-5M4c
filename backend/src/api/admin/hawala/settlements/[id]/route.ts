import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../../modules/hawala-ledger/service"
import { createStellarSettlementService } from "../../../../../modules/hawala-ledger/stellar-settlement"

/**
 * GET /admin/hawala/settlements/:id
 * Get settlement batch details
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)
  const { id } = req.params

  try {
    const batch = await hawalaService.retrieveSettlementBatch(id)
    if (!batch) {
      return res.status(404).json({ error: "Settlement batch not found" })
    }

    // Get entries in this batch
    const entries = await hawalaService.listLedgerEntries({
      settlement_batch_id: id,
    })

    res.json({ batch, entries })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

/**
 * POST /admin/hawala/settlements/:id/verify
 * Verify a settlement batch on Stellar blockchain
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)
  const { id } = req.params

  try {
    const batch = await hawalaService.retrieveSettlementBatch(id)
    if (!batch) {
      return res.status(404).json({ error: "Settlement batch not found" })
    }

    const stellarService = createStellarSettlementService()
    const verification = await stellarService.verifySettlementBatch(id)

    res.json({
      batch_id: id,
      stored_merkle_root: batch.merkle_root,
      blockchain_merkle_root: verification.merkleRoot,
      verified: verification.found && verification.merkleRoot === batch.merkle_root,
      stellar_tx_hash: batch.stellar_tx_hash,
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
