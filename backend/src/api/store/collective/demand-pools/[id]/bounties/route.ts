import { z } from "zod"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DEMAND_POOL_MODULE } from "../../../../../../modules/demand-pool"
import DemandPoolModuleService from "../../../../../../modules/demand-pool/service"

const addBountySchema = z.object({
  objective: z.enum([
    "FIND_SUPPLIER",
    "NEGOTIATE_PRICE",
    "RECRUIT_BUYERS",
    "COORDINATE_LOGISTICS",
    "FINALIZE_DEAL",
  ]),
  amount: z.number().positive(),
  currency_code: z.string().default("USD"),
  milestones: z
    .array(
      z.object({
        description: z.string(),
        percentage: z.number().min(0).max(100),
        condition: z.string(),
      })
    )
    .optional(),
  visibility: z.enum(["PUBLIC", "RESTRICTED"]).optional(),
})

// GET /store/collective/demand-pools/:id/bounties
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const demandPoolService = req.scope.resolve<DemandPoolModuleService>(
      DEMAND_POOL_MODULE
    )

    const bounties = await demandPoolService.listDemandBountys({
      demand_post_id: id,
    })

    res.json({ bounties })
  } catch (error: any) {
    console.error(`[GET /store/collective/demand-pools/${id}/bounties] Error:`, error.message)
    res.status(500).json({ error: "Failed to retrieve bounties" })
  }
}

// POST /store/collective/demand-pools/:id/bounties
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const body = addBountySchema.parse(req.body)
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const demandPoolService = req.scope.resolve<DemandPoolModuleService>(
      DEMAND_POOL_MODULE
    )

    const bounty = await demandPoolService.addBounty({
      demand_post_id: id,
      contributor_id: customerId,
      contributor_type: "CUSTOMER",
      objective: body.objective,
      amount: body.amount,
      currency_code: body.currency_code,
      milestones: body.milestones,
      visibility: body.visibility,
    })

    res.status(201).json({ bounty })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors })
    }
    console.error(`[POST /store/collective/demand-pools/${id}/bounties] Error:`, error.message)
    res.status(400).json({ error: error.message })
  }
}
