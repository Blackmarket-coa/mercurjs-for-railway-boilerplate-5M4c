import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createSalesChannelStep = createStep(
  "create-sales-channel",
  async ({}, { container }) => {
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

    const salesChannels = await salesChannelModuleService.createSalesChannels([
      {
        name: "B2B",
      },
      {
        name: "Mobile App",
      },
    ])

    return new StepResponse({ salesChannels }, salesChannels.map((sc) => sc.id))
  },
  async (salesChannelIds, { container }) => {
    if (!salesChannelIds) {
      return
    }
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

    await salesChannelModuleService.deleteSalesChannels(
      salesChannelIds
    )
  }
)

export const createSalesChannelWorkflow = createWorkflow(
  "create-sales-channel",
  () => {
    const { salesChannels } = createSalesChannelStep()

    return new WorkflowResponse({
      salesChannels,
    })
  }
)
