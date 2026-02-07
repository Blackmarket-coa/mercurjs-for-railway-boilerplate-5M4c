import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const DEMAND_POOL_MODULE = "demandPoolModuleService"

interface DemandPoolServiceType {
  createDemandPost: (data: Record<string, unknown>) => Promise<any>
  publishDemandPost: (id: string) => Promise<any>
  deleteDemandPosts: (id: string) => Promise<void>
}

type CreateDemandPostInput = {
  creator_id: string
  creator_type?: string
  title: string
  description: string
  category?: string
  specs?: Record<string, unknown>
  target_quantity: number
  min_quantity: number
  unit_of_measure?: string
  target_price?: number
  currency_code?: string
  delivery_region?: string
  delivery_address?: Record<string, unknown>
  delivery_window_start?: Date
  delivery_window_end?: Date
  deadline?: Date
  deadline_type?: string
  visibility?: string
  auto_publish?: boolean
  metadata?: Record<string, unknown>
}

const createDemandPostStep = createStep(
  "create-demand-post-step",
  async (input: CreateDemandPostInput, { container }) => {
    const service = container.resolve(DEMAND_POOL_MODULE) as DemandPoolServiceType

    const post = await service.createDemandPost({
      creator_id: input.creator_id,
      creator_type: input.creator_type || "CUSTOMER",
      title: input.title,
      description: input.description,
      category: input.category,
      specs: input.specs,
      target_quantity: input.target_quantity,
      min_quantity: input.min_quantity,
      unit_of_measure: input.unit_of_measure,
      target_price: input.target_price,
      currency_code: input.currency_code,
      delivery_region: input.delivery_region,
      delivery_address: input.delivery_address,
      delivery_window_start: input.delivery_window_start,
      delivery_window_end: input.delivery_window_end,
      deadline: input.deadline,
      deadline_type: input.deadline_type,
      visibility: input.visibility,
      metadata: input.metadata,
    })

    if (input.auto_publish) {
      await service.publishDemandPost(post.id)
    }

    return new StepResponse(post, post.id)
  },
  async (postId, { container }) => {
    if (!postId) return
    const service = container.resolve(DEMAND_POOL_MODULE) as DemandPoolServiceType
    await service.deleteDemandPosts(postId)
  }
)

export const createDemandPostWorkflow = createWorkflow(
  "create-demand-post-workflow",
  (input: CreateDemandPostInput) => {
    const post = createDemandPostStep(input)
    return new WorkflowResponse(post)
  }
)
