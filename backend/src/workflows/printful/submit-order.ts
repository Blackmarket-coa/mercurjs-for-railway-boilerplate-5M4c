import { createWorkflow, createStep, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import PrintfulClient, { PrintfulOrderPayload } from "../../modules/printful-fulfillment/client"

type SubmitPrintfulOrderInput = {
  api_key?: string
  store_id?: string
  order: PrintfulOrderPayload
}

type SubmitPrintfulOrderOutput = {
  skipped: boolean
  reason?: string
  result?: unknown
}

const submitPrintfulOrderStep = createStep(
  "submit-printful-order",
  async ({ api_key, store_id, order }: SubmitPrintfulOrderInput) => {
    if (!api_key) {
      return new StepResponse<SubmitPrintfulOrderOutput>({
        skipped: true,
        reason: "PRINTFUL_API_KEY is not configured",
      })
    }

    const client = new PrintfulClient({
      apiKey: api_key,
      storeId: store_id,
    })

    const result = await client.createOrder(order)

    return new StepResponse<SubmitPrintfulOrderOutput>({ skipped: false, result })
  }
)

export const submitPrintfulOrderWorkflow = createWorkflow(
  "submit-printful-order",
  (input: SubmitPrintfulOrderInput) => {
    const output = submitPrintfulOrderStep(input)

    return new WorkflowResponse(output)
  }
)

export default submitPrintfulOrderWorkflow
