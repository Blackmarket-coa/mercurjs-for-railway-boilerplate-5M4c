import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { WOOCOMMERCE_IMPORT_MODULE } from "../../../modules/woocommerce-import"
import WooCommerceImportModuleService from "../../../modules/woocommerce-import/service"
import { encrypt } from "../../../modules/woocommerce-import/lib/encryption"

export type SaveWooConnectionInput = {
  seller_id: string
  store_url: string
  consumer_key: string
  consumer_secret: string
  store_name: string
  currency: string
}

const saveWooConnectionStep = createStep(
  "save-woo-connection-step",
  async (input: SaveWooConnectionInput, { container }) => {
    const wooService: WooCommerceImportModuleService = container.resolve(
      WOOCOMMERCE_IMPORT_MODULE
    )

    // Check for existing connection for this seller
    const existing = await wooService.listWooCommerceConnections({
      seller_id: input.seller_id,
    })

    if (existing.length > 0) {
      // Update existing connection
      const updated = await wooService.updateWooCommerceConnections({
        id: existing[0].id,
        store_url: encrypt(input.store_url),
        consumer_key: encrypt(input.consumer_key),
        consumer_secret: encrypt(input.consumer_secret),
        store_name: input.store_name,
        currency: input.currency,
      })

      return new StepResponse(
        { connection: updated, is_update: true },
        { id: existing[0].id, is_update: true }
      )
    }

    // Create new connection
    const connection = await wooService.createWooCommerceConnections({
      seller_id: input.seller_id,
      store_url: encrypt(input.store_url),
      consumer_key: encrypt(input.consumer_key),
      consumer_secret: encrypt(input.consumer_secret),
      store_name: input.store_name,
      currency: input.currency,
      sync_inventory: true,
    })

    return new StepResponse(
      { connection, is_update: false },
      { id: connection.id, is_update: false }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData || compensationData.is_update) return

    const wooService: WooCommerceImportModuleService = container.resolve(
      WOOCOMMERCE_IMPORT_MODULE
    )
    await wooService.deleteWooCommerceConnections(compensationData.id)
  }
)

export default saveWooConnectionStep
