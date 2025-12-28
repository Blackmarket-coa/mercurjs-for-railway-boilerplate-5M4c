import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// GET /vendor/order-cycles/:id/exchanges - List exchanges
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const orderCycleService = req.scope.resolve("orderCycleModuleService")

  try {
    const incoming = await orderCycleService.listOrderCycleExchanges({
      order_cycle_id: id,
      exchange_type: "incoming",
    })

    const outgoing = await orderCycleService.listOrderCycleExchanges({
      order_cycle_id: id,
      exchange_type: "outgoing",
    })

    res.json({ incoming, outgoing })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exchanges", error: error.message })
  }
}

// POST /vendor/order-cycles/:id/exchanges - Create exchange
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { exchange_type, seller_id, receiver_id, pickup_time, pickup_instructions, ready_at } = req.body
  const orderCycleService = req.scope.resolve("orderCycleModuleService")

  try {
    const exchange = await orderCycleService.createOrderCycleExchanges({
      order_cycle_id: id,
      exchange_type,
      seller_id,
      receiver_id,
      pickup_time,
      pickup_instructions,
      ready_at: ready_at ? new Date(ready_at) : undefined,
    })

    res.status(201).json({ exchange })
  } catch (error) {
    res.status(500).json({ message: "Failed to create exchange", error: error.message })
  }
}
