import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const DEMAND_POOL_MODULE = "demandPoolModuleService"

interface DemandPoolServiceType {
  selectSupplier: (demandPostId: string, proposalId: string) => Promise<any>
  updateDemandPosts: (data: Record<string, unknown>) => Promise<any>
  updateSupplierProposals: (data: Record<string, unknown>) => Promise<any>
}

type SelectSupplierInput = {
  demand_post_id: string
  proposal_id: string
}

const selectSupplierStep = createStep(
  "select-supplier-step",
  async (input: SelectSupplierInput, { container }) => {
    const service = container.resolve(DEMAND_POOL_MODULE) as DemandPoolServiceType

    const result = await service.selectSupplier(
      input.demand_post_id,
      input.proposal_id
    )

    return new StepResponse(result, input)
  },
  async (context, { container }) => {
    if (!context) return
    const service = container.resolve(DEMAND_POOL_MODULE) as DemandPoolServiceType
    // Revert by clearing supplier selection and restoring status
    await service.updateDemandPosts({
      id: context.demand_post_id,
      selected_supplier_id: null,
      final_unit_price: null,
      final_total_price: null,
      status: "NEGOTIATING",
    })
    await service.updateSupplierProposals({
      id: context.proposal_id,
      status: "SUBMITTED",
      reviewed_at: null,
    })
  }
)

export const selectSupplierWorkflow = createWorkflow(
  "select-supplier-workflow",
  (input: SelectSupplierInput) => {
    const result = selectSupplierStep(input)
    return new WorkflowResponse(result)
  }
)
