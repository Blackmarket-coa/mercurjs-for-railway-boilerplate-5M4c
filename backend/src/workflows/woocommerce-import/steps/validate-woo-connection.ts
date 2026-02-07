import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { WooApiClient } from "../../../modules/woocommerce-import/lib/woo-api-client"
import type { WooCredentials } from "../../../modules/woocommerce-import/types"

export type ValidateWooConnectionInput = {
  credentials: WooCredentials
}

const validateWooConnectionStep = createStep(
  "validate-woo-connection-step",
  async (input: ValidateWooConnectionInput) => {
    const client = new WooApiClient(input.credentials)
    const storeInfo = await client.validateConnection()

    return new StepResponse({
      store_name: storeInfo.store_name,
      wc_version: storeInfo.wc_version,
      currency: storeInfo.currency,
    })
  }
)

export default validateWooConnectionStep
