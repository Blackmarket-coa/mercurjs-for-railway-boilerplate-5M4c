import { model } from "@medusajs/framework/utils"
import WooCommerceImportLog from "./woocommerce-import-log"

const WooCommerceConnection = model.define("woocommerce_connection", {
  id: model.id().primaryKey(),
  seller_id: model.text().unique(),
  store_url: model.text(),
  consumer_key: model.text(),
  consumer_secret: model.text(),
  store_name: model.text().nullable(),
  currency: model.text().nullable(),
  sync_inventory: model.boolean().default(true),
  last_synced_at: model.dateTime().nullable(),
  last_sync_report: model.json().nullable(),
  import_logs: model.hasMany(() => WooCommerceImportLog, {
    mappedBy: "connection",
  }),
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["seller_id"], name: "IDX_woo_connection_seller_id" },
  ])
  .cascades({
    delete: ["import_logs"],
  })

export default WooCommerceConnection
