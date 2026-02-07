import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import validateWooConnectionStep from "./steps/validate-woo-connection"
import saveWooConnectionStep from "./steps/save-woo-connection"
import type { WooCredentials } from "../../modules/woocommerce-import/types"

type ConnectWooCommerceInput = {
  seller_id: string
  store_url: string
  consumer_key: string
  consumer_secret: string
}

export const connectWooCommerceWorkflow = createWorkflow(
  "connect-woocommerce",
  (input: ConnectWooCommerceInput) => {
    const credentials: WooCredentials = {
      url: input.store_url,
      consumer_key: input.consumer_key,
      consumer_secret: input.consumer_secret,
    }

    // Step 1: Validate the WooCommerce connection
    const storeInfo = validateWooConnectionStep({ credentials })

    // Step 2: Save the connection credentials
    const { connection } = saveWooConnectionStep({
      seller_id: input.seller_id,
      store_url: input.store_url,
      consumer_key: input.consumer_key,
      consumer_secret: input.consumer_secret,
      store_name: storeInfo.store_name,
      currency: storeInfo.currency,
    })

    return new WorkflowResponse({
      connection,
      store_info: storeInfo,
    })
  }
)

export default connectWooCommerceWorkflow
