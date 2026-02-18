import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { invoiceSchema } from "../../../shared/phase0-contracts"
import { runQueueConsumer } from "../../../shared/queue-runtime"
import { requeueWithBackoff } from "../../../shared/queue-requeue-adapter"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = invoiceSchema.parse(req.body)

  const result = await runQueueConsumer({
    topicKey: "invoice_issuance",
    payload,
    idempotencyKey: payload.invoice_id,
    handler: async () => undefined,
    publishToDlq: async (message) => {
      console.error("[POST /vendor/invoices][DLQ]", JSON.stringify(message))
    },
    requeue: async (message, delaySeconds) => {
      await requeueWithBackoff(message, delaySeconds)
    },
  })

  res.status(202).json({ result, topic: "invoice.issuance.v1" })
}
