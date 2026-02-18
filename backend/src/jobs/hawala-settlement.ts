import { MedusaContainer } from "@medusajs/framework/types"
import { HAWALA_LEDGER_MODULE } from "../modules/hawala-ledger"
import HawalaLedgerModuleService from "../modules/hawala-ledger/service"
import { createStellarSettlementService } from "../modules/hawala-ledger/stellar-settlement"
import { runQueueConsumer } from "../shared/queue-runtime"
import { requeueWithBackoff } from "../shared/queue-requeue-adapter"

/**
 * Scheduled job that creates settlement batches and anchors to Stellar
 * Runs daily at midnight UTC
 */
export default async function hawalaSettlementJob(container: MedusaContainer) {
  const hawalaService = container.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  console.log("[Hawala Settlement] Starting daily settlement batch...")

  const publishToDlq = async (message: any) => {
    console.error("[Hawala Settlement][DLQ]", JSON.stringify(message))
  }
  const requeue = async (message: any, delaySeconds: number) => {
    await requeueWithBackoff(message, delaySeconds)
  }


  try {
    // Get unsettled entries from the last 24 hours
    const entries = await hawalaService.listLedgerEntries({
      status: "COMPLETED",
    })

    // Filter to only unsettled entries
    const unsettledEntries = entries.filter(e => !e.settlement_batch_id)

    if (unsettledEntries.length === 0) {
      console.log("[Hawala Settlement] No unsettled entries found")
      return
    }

    console.log(`[Hawala Settlement] Found ${unsettledEntries.length} unsettled entries`)

    // Calculate totals
    const totalVolume = unsettledEntries.reduce((sum, e) => sum + Number(e.amount), 0)

    // Generate batch number
    const existingBatches = await hawalaService.listSettlementBatches({})
    const batchNumber = existingBatches.length + 1

    // Create batch record
    const periodEnd = new Date()
    const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000)

    const batch = await hawalaService.createSettlementBatches({
      batch_number: batchNumber,
      period_start: periodStart,
      period_end: periodEnd,
      total_entries: unsettledEntries.length,
      total_volume: totalVolume,
      status: "PENDING",
    })

    console.log(`[Hawala Settlement] Created batch #${batchNumber}`)

    const invoiceEvent = {
      invoice_id: `settlement-${batch.id}`,
      order_id: batch.id,
      status: "issued" as const,
      total: Math.round(totalVolume * 100),
      currency_code: "USD",
      issued_at: new Date().toISOString(),
    }

    const result = await runQueueConsumer({
      topicKey: "invoice_issuance",
      payload: invoiceEvent,
      idempotencyKey: invoiceEvent.invoice_id,
      handler: async () => {
        // Submit to Stellar
        const stellarService = createStellarSettlementService()

        const stellarResult = await stellarService.submitSettlementBatch({
          batchId: batch.id,
          entries: unsettledEntries.map(e => ({
            id: e.id,
            amount: Number(e.amount),
            debit_account_id: e.debit_account_id,
            credit_account_id: e.credit_account_id,
            created_at: new Date(e.created_at),
          })),
          periodStart,
          periodEnd,
        })

        // Update batch with Stellar info
        await hawalaService.updateSettlementBatches({
          id: batch.id,
          merkle_root: stellarResult.merkleRoot,
          stellar_tx_hash: stellarResult.txHash,
          stellar_ledger_sequence: stellarResult.ledgerSequence,
          stellar_fee_paid: stellarResult.feePaid,
          status: "CONFIRMED" as const,
          confirmed_at: new Date(),
        })

        // Update all entries with batch reference
        for (const entry of unsettledEntries) {
          await hawalaService.updateLedgerEntries({
            id: entry.id,
            settlement_batch_id: batch.id,
            status: "SETTLED" as const,
            settled_at: new Date(),
          })
        }

        console.log(`[Hawala Settlement] Batch #${batchNumber} anchored to Stellar:`)
        console.log(`  - TX Hash: ${stellarResult.txHash}`)
        console.log(`  - Merkle Root: ${stellarResult.merkleRoot}`)
        console.log(`  - Entries: ${unsettledEntries.length}`)
        console.log(`  - Volume: $${totalVolume.toFixed(2)}`)
      },
      publishToDlq,
      requeue,
    })

    if (result.status !== "processed") {
      await hawalaService.updateSettlementBatches({
        id: batch.id,
        status: "FAILED",
        metadata: {
          queue_status: result.status,
          retries: result.retries,
          error: result.error,
        },
      })
    }
  } catch (error) {
    console.error("[Hawala Settlement] Settlement job failed:", error)
  }
}

export const config = {
  name: "hawala-daily-settlement",
  schedule: "0 0 * * *", // Daily at midnight UTC
}
