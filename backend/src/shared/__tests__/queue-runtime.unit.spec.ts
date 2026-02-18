import { runQueueConsumer } from "../queue-runtime"

describe("queue runtime", () => {
  it("returns retry metadata before max retries", async () => {
    const result = await runQueueConsumer({
      topicKey: "inventory_sync",
      payload: {
        event_id: "evt_1",
        occurred_at: new Date().toISOString(),
        product_id: "prod_1",
        variant_id: "var_1",
        delta: 1,
        reason: "test",
        channel: "storefront",
      },
      handler: async () => {
        throw new Error("boom")
      },
      publishToDlq: async () => undefined,
    })

    expect(result.status).toBe("retry")
    expect(result.retries).toBe(1)
  })

  it("routes to dlq after retries exhausted", async () => {
    const dlq: unknown[] = []

    const result = await runQueueConsumer({
      topicKey: "invoice_issuance",
      attempt: 6,
      payload: {
        invoice_id: "inv_1",
        order_id: "ord_1",
        status: "issued",
        total: 100,
        currency_code: "USD",
        issued_at: new Date().toISOString(),
      },
      handler: async () => {
        throw new Error("permanent")
      },
      publishToDlq: async (message) => {
        dlq.push(message)
      },
    })

    expect(result.status).toBe("dlq")
    expect(dlq).toHaveLength(1)
  })
})
