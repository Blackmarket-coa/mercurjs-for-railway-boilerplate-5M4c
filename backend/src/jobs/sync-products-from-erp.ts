import {
  MedusaContainer,
} from "@medusajs/framework/types"
import { syncFromErpWorkflow } from "../workflows/sync-from-erp"
import { OdooProduct } from "../modules/odoo/service"

export default async function syncProductsJob(container: MedusaContainer) {
  const limit = 10
  let offset = 0
  let total = 0
  let odooProducts: OdooProduct[] = []

  console.log("Syncing products...")

  do {
    odooProducts = (await syncFromErpWorkflow(container).run({
      input: {
        limit,
        offset,
      },
    })).result.odooProducts

    offset += limit
    total += odooProducts.length
  } while (odooProducts.length > 0)

  console.log(`Synced ${total} products`)
}

export const config = {
  name: "daily-product-sync",
  schedule: "0 0 * * *", // Every day at midnight
}
