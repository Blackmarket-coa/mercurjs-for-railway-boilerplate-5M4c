import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const DEMAND_POOL_MODULE = "demandPoolModuleService"

interface DemandPoolServiceType {
  joinDemandPool: (data: {
    demand_post_id: string
    customer_id: string
    quantity_committed: number
    price_willing_to_pay?: number
  }) => Promise<any>
  withdrawFromPool: (demandPostId: string, customerId: string) => Promise<any>
}

type JoinDemandPoolInput = {
  demand_post_id: string
  customer_id: string
  quantity_committed: number
  price_willing_to_pay?: number
}

const joinDemandPoolStep = createStep(
  "join-demand-pool-step",
  async (input: JoinDemandPoolInput, { container }) => {
    const service = container.resolve(DEMAND_POOL_MODULE) as DemandPoolServiceType

    const participant = await service.joinDemandPool({
      demand_post_id: input.demand_post_id,
      customer_id: input.customer_id,
      quantity_committed: input.quantity_committed,
      price_willing_to_pay: input.price_willing_to_pay,
    })

    return new StepResponse(participant, {
      demand_post_id: input.demand_post_id,
      customer_id: input.customer_id,
    })
  },
  async (context, { container }) => {
    if (!context) return
    const service = container.resolve(DEMAND_POOL_MODULE) as DemandPoolServiceType
    await service.withdrawFromPool(context.demand_post_id, context.customer_id)
  }
)

export const joinDemandPoolWorkflow = createWorkflow(
  "join-demand-pool-workflow",
  (input: JoinDemandPoolInput) => {
    const participant = joinDemandPoolStep(input)
    return new WorkflowResponse(participant)
  }
)
