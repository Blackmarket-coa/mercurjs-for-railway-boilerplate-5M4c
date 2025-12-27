import { 
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import { ORDER_CYCLE_MODULE } from "../../../modules/order-cycle"
import type OrderCycleModuleService from "../../../modules/order-cycle/service"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const orderCycleService = req.scope.resolve<OrderCycleModuleService>(ORDER_CYCLE_MODULE)

  try {
    const { limit = 20, offset = 0, status } = req.query as {
      status?: string
      limit?: number
      offset?: number
    }

    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit
    const offsetNum = typeof offset === 'string' ? parseInt(offset, 10) : offset

    const filters: Record<string, unknown> = {}
    if (status) {
      filters.status = typeof status === 'string' ? status.split(",") : status
    }

    const orderCycles = await orderCycleService.listOrderCycles(filters, {
      take: limitNum,
      skip: offsetNum,
      order: { created_at: "DESC" },
    })

    const allCycles = await orderCycleService.listOrderCycles(filters)

    res.json({
      order_cycles: orderCycles,
      count: allCycles.length,
      limit: limitNum,
      offset: offsetNum,
    })
  } catch (error) {
    console.error("Error fetching order cycles:", error)
    res.status(500).json({ message: "Failed to fetch order cycles", error: String(error) })
  }
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const orderCycleService = req.scope.resolve<OrderCycleModuleService>(ORDER_CYCLE_MODULE)

  try {
    const {
      name,
      description,
      opens_at,
      closes_at,
      dispatch_at,
      pickup_instructions,
    } = req.body as {
      name: string
      description?: string
      opens_at: string
      closes_at: string
      dispatch_at?: string
      pickup_instructions?: string
    }

    if (!name || !opens_at || !closes_at) {
      return res.status(400).json({
        message: "Missing required fields: name, opens_at, closes_at",
      })
    }

    const openDate = new Date(opens_at)
    const closeDate = new Date(closes_at)
    const dispatchDate = dispatch_at ? new Date(dispatch_at) : undefined

    if (closeDate <= openDate) {
      return res.status(400).json({
        message: "closes_at must be after opens_at",
      })
    }

    const now = new Date()
    let status: "draft" | "upcoming" | "open" = "draft"
    if (openDate <= now && closeDate > now) {
      status = "open"
    } else if (openDate > now) {
      status = "upcoming"
    }

    const orderCycle = await orderCycleService.createOrderCycles({
      name,
      description,
      opens_at: openDate,
      closes_at: closeDate,
      dispatch_at: dispatchDate,
      status,
      pickup_instructions,
    })

    res.status(201).json({ order_cycle: orderCycle })
  } catch (error) {
    console.error("Error creating order cycle:", error)
    res.status(500).json({ message: "Failed to create order cycle", error: String(error) })
  }
}
