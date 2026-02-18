import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { inventoryLedgerEventSchema } from "../../../../shared/phase0-contracts"
import { runQueueConsumer } from "../../../../shared/queue-runtime"
import { requeueWithBackoff } from "../../../../shared/queue-requeue-adapter"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = inventoryLedgerEventSchema.parse(req.body)

  const result = await runQueueConsumer({
    topicKey: "inventory_sync",
    payload,
    idempotencyKey: payload.idempotency_key,
    handler: async () => undefined,
    publishToDlq: async (message) => {
      console.error("[POST /vendor/inventory-sync/events][DLQ]", JSON.stringify(message))
    },
    requeue: async (message, delaySeconds) => {
      await requeueWithBackoff(message, delaySeconds)
    },
  })

  res.status(202).json({ result, topic: "inventory.sync.v1" })
}
