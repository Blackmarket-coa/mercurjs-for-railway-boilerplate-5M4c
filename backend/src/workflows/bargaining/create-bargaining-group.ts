import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const BARGAINING_MODULE = "bargainingModuleService"

interface BargainingServiceType {
  createGroup: (data: Record<string, unknown>) => Promise<any>
  deleteBargainingGroups: (id: string) => Promise<void>
}

type CreateBargainingGroupInput = {
  name: string
  description?: string
  category?: string
  organizer_id: string
  organizer_type?: string
  common_requirements?: Record<string, unknown>
  delivery_specs?: Record<string, unknown>
  payment_terms?: Record<string, unknown>
  quality_standards?: Record<string, unknown>
  voting_rule?: string
  approval_threshold?: number
  min_members?: number
  max_members?: number
  currency_code?: string
  demand_post_id?: string
  buyer_network_id?: string
  negotiation_deadline?: Date
}

const createGroupStep = createStep(
  "create-bargaining-group-step",
  async (input: CreateBargainingGroupInput, { container }) => {
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType

    const group = await service.createGroup(input)
    return new StepResponse(group, group.id)
  },
  async (groupId, { container }) => {
    if (!groupId) return
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType
    await service.deleteBargainingGroups(groupId)
  }
)

export const createBargainingGroupWorkflow = createWorkflow(
  "create-bargaining-group-workflow",
  (input: CreateBargainingGroupInput) => {
    const group = createGroupStep(input)
    return new WorkflowResponse(group)
  }
)
