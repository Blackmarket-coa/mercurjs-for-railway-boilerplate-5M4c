import { createWorkflow, createStep, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import PrintfulClient from "../../modules/printful-fulfillment/client"

type SyncPrintfulCatalogInput = {
  api_key?: string
  store_id?: string
}

const fetchPrintfulCatalogStep = createStep(
  "fetch-printful-catalog",
  async (input: SyncPrintfulCatalogInput) => {
    if (!input.api_key) {
      return new StepResponse({ products: [], skipped: true })
    }

    const client = new PrintfulClient({
      apiKey: input.api_key,
      storeId: input.store_id,
    })

    const products = await client.getCatalogProducts()

    return new StepResponse({ products, skipped: false })
  }
)

export const syncPrintfulCatalogWorkflow = createWorkflow(
  "sync-printful-catalog",
  (input: SyncPrintfulCatalogInput) => {
    const catalog = fetchPrintfulCatalogStep(input)

    return new WorkflowResponse(catalog)
  }
)

export default syncPrintfulCatalogWorkflow
