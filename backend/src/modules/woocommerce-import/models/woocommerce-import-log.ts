import { model } from "@medusajs/framework/utils"
import { ImportStatus } from "../types"
import WooCommerceConnection from "./woocommerce-connection"

const WooCommerceImportLog = model.define("woocommerce_import_log", {
  id: model.id().primaryKey(),
  connection: model.belongsTo(() => WooCommerceConnection, {
    mappedBy: "import_logs",
  }),
  status: model.enum(ImportStatus).default(ImportStatus.PENDING),
  total_products: model.number().default(0),
  imported_count: model.number().default(0),
  failed_count: model.number().default(0),
  skipped_count: model.number().default(0),
  import_as_draft: model.boolean().default(true),
  error_details: model.json().nullable(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["status"], name: "IDX_woo_import_log_status" },
  ])

export default WooCommerceImportLog
