import { runQueueConsumer } from "../queue-runtime"

const requeue = jest.fn(async () => undefined)
const publishToDlq = jest.fn(async () => undefined)

describe("queue runtime", () => {
  beforeEach(() => {
    requeue.mockClear()
    publishToDlq.mockClear()
  })

  it("returns retry metadata before max retries and requeues", async () => {
    const result = await runQueueConsumer({
      topicKey: "inventory_sync",
      payload: {
        event_id: `evt_${Date.now()}`,
        occurred_at: new Date().toISOString(),
        product_id: "prod_1",
        variant_id: "var_1",
        delta: 1,
        reason: "test",
        channel: "storefront",
      },
      idempotencyKey: `idem_${Date.now()}`,
      handler: async () => {
        throw new Error("boom")
      },
      publishToDlq,
      requeue,
    })

    expect(result.status).toBe("retry")
    expect(result.retries).toBe(1)
    expect(requeue).toHaveBeenCalledTimes(1)
  })

  it("routes to dlq after retries exhausted", async () => {
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
      idempotencyKey: `invoice_1_${Date.now()}`,
      handler: async () => {
        throw new Error("permanent")
      },
      publishToDlq,
      requeue,
    })

    expect(result.status).toBe("dlq")
    expect(publishToDlq).toHaveBeenCalledTimes(1)
  })

  it("returns duplicate when idempotency key is reused with same payload", async () => {
    const payload = {
      event_id: "evt_duplicate",
      occurred_at: new Date().toISOString(),
      product_id: "prod_1",
      variant_id: "var_1",
      delta: 0,
      reason: "test",
      channel: "storefront" as const,
    }

    const key = `idem-duplicate-${Date.now()}`

    await runQueueConsumer({
      topicKey: "inventory_sync",
      payload,
      idempotencyKey: key,
      handler: async () => undefined,
      publishToDlq,
      requeue,
    })

    const duplicate = await runQueueConsumer({
      topicKey: "inventory_sync",
      payload,
      idempotencyKey: key,
      handler: async () => undefined,
      publishToDlq,
      requeue,
    })

    expect(duplicate.status).toBe("duplicate")
  })

  it("returns idempotency_conflict when same key has different payload", async () => {
    const key = `idem-conflict-${Date.now()}`

    await runQueueConsumer({
      topicKey: "payments_settlement",
      payload: {
        event_id: "evt-1",
        order_id: "ord-1",
        occurred_at: new Date().toISOString(),
        status: "settled",
        channel: "storefront",
      },
      idempotencyKey: key,
      handler: async () => undefined,
      publishToDlq,
      requeue,
    })

    const conflict = await runQueueConsumer({
      topicKey: "payments_settlement",
      payload: {
        event_id: "evt-2",
        order_id: "ord-2",
        occurred_at: new Date().toISOString(),
        status: "settled",
        channel: "pos",
      },
      idempotencyKey: key,
      handler: async () => undefined,
      publishToDlq,
      requeue,
    })

    expect(conflict.status).toBe("idempotency_conflict")
  })
})
