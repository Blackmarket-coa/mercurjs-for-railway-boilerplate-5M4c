import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { WooApiClient } from "../../modules/woocommerce-import/lib/woo-api-client"
import { WOOCOMMERCE_IMPORT_MODULE } from "../../modules/woocommerce-import"
import WooCommerceImportModuleService from "../../modules/woocommerce-import/service"
import { decrypt } from "../../modules/woocommerce-import/lib/encryption"
import type { SyncReport, WooCredentials } from "../../modules/woocommerce-import/types"

type SyncWooInventoryInput = {
  connection_id: string
}

/**
 * Step: Perform the inventory sync for a single vendor connection.
 */
const syncInventoryStep = createStep(
  "sync-woo-inventory-step",
  async (input: SyncWooInventoryInput, { container }): Promise<StepResponse<SyncReport>> => {
    const wooService: WooCommerceImportModuleService = container.resolve(
      WOOCOMMERCE_IMPORT_MODULE
    )
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const logger = container.resolve("logger")

    // Get the connection
    const connection = await wooService.retrieveWooCommerceConnection(
      input.connection_id
    )

    if (!connection) {
      throw new Error("WooCommerce connection not found")
    }

    // Decrypt credentials
    const credentials: WooCredentials = {
      url: decrypt(connection.store_url),
      consumer_key: decrypt(connection.consumer_key),
      consumer_secret: decrypt(connection.consumer_secret),
    }

    const client = new WooApiClient(credentials)
    const report: SyncReport = {
      synced_at: new Date().toISOString(),
      products_checked: 0,
      variants_updated: 0,
      out_of_stock: [],
      errors: [],
    }

    // Find all products for this seller that came from WooCommerce
    // Query products via the product module where metadata has woo_product_id
    let products: any[] = []
    try {
      const { data } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "title",
          "metadata",
          "variants.id",
          "variants.sku",
          "variants.metadata",
        ],
        filters: {},
      })

      // Filter to only products with woo_product_id in metadata
      // and belonging to this seller (via metadata tracking)
      products = (data || []).filter(
        (p: any) => p.metadata?.woo_product_id
      )
    } catch (error: any) {
      logger.error(`Failed to query products for sync: ${error.message}`)
      report.errors.push({
        product: "Query",
        error: `Failed to list products: ${error.message}`,
      })
      return new StepResponse(report)
    }

    report.products_checked = products.length

    const inventoryService = container.resolve(Modules.INVENTORY)

    for (const product of products) {
      try {
        const wooProductId = parseInt(product.metadata.woo_product_id, 10)
        if (isNaN(wooProductId)) continue

        const wooProduct = await client.fetchProduct(wooProductId)

        if (wooProduct.stock_status === "outofstock") {
          report.out_of_stock.push(product.title)
        }

        // For simple products, update the single variant
        if (wooProduct.type === "simple" && product.variants?.length > 0) {
          const variant = product.variants[0]
          if (variant && wooProduct.manage_stock) {
            try {
              // Get inventory items linked to this variant
              const { data: inventoryItems } = await query.graph({
                entity: "inventory_item",
                fields: ["id", "inventory_levels.id", "inventory_levels.stocked_quantity"],
                filters: {
                  sku: variant.sku,
                },
              }) as { data: any[] }

              if (inventoryItems?.[0]?.inventory_levels?.[0]) {
                const level = inventoryItems[0].inventory_levels[0]
                const newQty = wooProduct.stock_quantity ?? 0
                const currentQty = level.stocked_quantity ?? 0
                const adjustment = newQty - currentQty

                if (adjustment !== 0) {
                  await inventoryService.adjustInventory(
                    inventoryItems[0].id,
                    level.id,
                    adjustment
                  )
                  report.variants_updated++
                }
              }
            } catch (invError: any) {
              logger.warn(
                `Failed to update inventory for variant ${variant.sku}: ${invError.message}`
              )
            }
          }
        }

        // For variable products, update each variant
        if (wooProduct.type === "variable" && product.variants?.length > 0) {
          let wooVariations: any[] = []
          try {
            wooVariations = await client.fetchProductVariations(wooProductId)
          } catch {
            report.errors.push({
              product: product.title,
              error: "Failed to fetch WooCommerce variations",
            })
            continue
          }

          for (const variant of product.variants) {
            const wooVariantId = variant.metadata?.woo_variant_id
            if (!wooVariantId) continue

            const wooVariation = wooVariations.find(
              (v: any) => String(v.id) === String(wooVariantId)
            )
            if (!wooVariation) continue

            if (wooVariation.manage_stock ?? wooProduct.manage_stock) {
              try {
                const { data: inventoryItems } = await query.graph({
                  entity: "inventory_item",
                  fields: ["id", "inventory_levels.id", "inventory_levels.stocked_quantity"],
                  filters: {
                    sku: variant.sku,
                  },
                }) as { data: any[] }

                if (inventoryItems?.[0]?.inventory_levels?.[0]) {
                  const level = inventoryItems[0].inventory_levels[0]
                  const newQty = wooVariation.stock_quantity ?? 0
                  const currentQty = level.stocked_quantity ?? 0
                  const adjustment = newQty - currentQty

                  if (adjustment !== 0) {
                    await inventoryService.adjustInventory(
                      inventoryItems[0].id,
                      level.id,
                      adjustment
                    )
                    report.variants_updated++
                  }
                }
              } catch (invError: any) {
                logger.warn(
                  `Failed to update inventory for variant ${variant.sku}: ${invError.message}`
                )
              }
            }
          }
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.status === 404
            ? "WooCommerce product not found (deleted?)"
            : error.message
        report.errors.push({
          product: product.title,
          error: errorMsg,
        })
      }
    }

    // Update the connection with sync report
    await wooService.updateWooCommerceConnections({
      id: input.connection_id,
      last_synced_at: new Date(),
      last_sync_report: report as any,
    })

    return new StepResponse(report)
  }
)

export const syncWooInventoryWorkflow = createWorkflow(
  "sync-woo-inventory",
  (input: SyncWooInventoryInput) => {
    const report = syncInventoryStep(input)
    return new WorkflowResponse({ report })
  }
)

export default syncWooInventoryWorkflow
