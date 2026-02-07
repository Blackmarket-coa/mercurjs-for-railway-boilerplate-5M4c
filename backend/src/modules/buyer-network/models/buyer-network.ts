import { model } from "@medusajs/framework/utils"

export enum NetworkType {
  INDUSTRY_GROUP = "INDUSTRY_GROUP",
  LOCAL_CHAPTER = "LOCAL_CHAPTER",
  COOPERATIVE = "COOPERATIVE",
  BUYING_CLUB = "BUYING_CLUB",
  TRADE_ASSOCIATION = "TRADE_ASSOCIATION",
}

export enum NetworkStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

const BuyerNetwork = model.define("buyer_network", {
  id: model.id().primaryKey(),

  name: model.text().searchable(),
  handle: model.text().unique(),
  description: model.text().nullable(),

  network_type: model
    .enum(Object.values(NetworkType))
    .default(NetworkType.BUYING_CLUB),

  // Industry/category focus
  industry: model.text().nullable(),
  categories: model.json().nullable(),

  // Location
  region: model.text().nullable(),
  geo_bounds: model.json().nullable(),

  // Governance
  admin_id: model.text(),
  is_public: model.boolean().default(true),
  requires_approval: model.boolean().default(false),
  min_purchase_commitment: model.bigNumber().nullable(),
  currency_code: model.text().default("USD"),

  // Stats
  member_count: model.number().default(0),
  total_savings: model.bigNumber().default(0),
  completed_group_buys: model.number().default(0),
  active_demand_posts: model.number().default(0),

  // Trust & reputation
  trust_score: model.float().default(0),
  verified: model.boolean().default(false),

  status: model
    .enum(Object.values(NetworkStatus))
    .default(NetworkStatus.ACTIVE),

  // Preferred suppliers
  preferred_suppliers: model.json().nullable(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["handle"], name: "IDX_bnetwork_handle" },
  { on: ["network_type"], name: "IDX_bnetwork_type" },
  { on: ["industry"], name: "IDX_bnetwork_industry" },
  { on: ["region"], name: "IDX_bnetwork_region" },
  { on: ["status"], name: "IDX_bnetwork_status" },
  { on: ["admin_id"], name: "IDX_bnetwork_admin" },
])

export default BuyerNetwork
