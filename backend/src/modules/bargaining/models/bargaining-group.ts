import { model } from "@medusajs/framework/utils"

export enum BargainingGroupStatus {
  FORMING = "FORMING",
  OPEN = "OPEN",
  NEGOTIATING = "NEGOTIATING",
  TERMS_AGREED = "TERMS_AGREED",
  COMPLETED = "COMPLETED",
  DISBANDED = "DISBANDED",
}

export enum VotingRule {
  ONE_MEMBER_ONE_VOTE = "ONE_MEMBER_ONE_VOTE",
  WEIGHTED_BY_QUANTITY = "WEIGHTED_BY_QUANTITY",
  SUPERMAJORITY = "SUPERMAJORITY",
  SIMPLE_MAJORITY = "SIMPLE_MAJORITY",
}

const BargainingGroup = model.define("bargaining_group", {
  id: model.id().primaryKey(),

  // Group info
  name: model.text().searchable(),
  description: model.text().nullable(),
  category: model.text().nullable(),

  // Organizer
  organizer_id: model.text(),
  organizer_type: model.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),

  // Requirements
  common_requirements: model.json().nullable(),
  delivery_specs: model.json().nullable(),
  payment_terms: model.json().nullable(),
  quality_standards: model.json().nullable(),

  // Governance
  voting_rule: model
    .enum(Object.values(VotingRule))
    .default(VotingRule.SIMPLE_MAJORITY),
  approval_threshold: model.float().default(51),
  min_members: model.number().default(2),
  max_members: model.number().nullable(),

  // Status
  status: model
    .enum(Object.values(BargainingGroupStatus))
    .default(BargainingGroupStatus.FORMING),

  member_count: model.number().default(0),
  total_quantity: model.number().default(0),
  total_budget: model.bigNumber().default(0),
  currency_code: model.text().default("USD"),

  // Linked demand post (optional)
  demand_post_id: model.text().nullable(),

  // Network membership (optional)
  buyer_network_id: model.text().nullable(),

  // Timing
  negotiation_deadline: model.dateTime().nullable(),
  formed_at: model.dateTime().nullable(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["status"], name: "IDX_bgroup_status" },
  { on: ["organizer_id"], name: "IDX_bgroup_organizer" },
  { on: ["category"], name: "IDX_bgroup_category" },
  { on: ["demand_post_id"], name: "IDX_bgroup_demand_post" },
  { on: ["buyer_network_id"], name: "IDX_bgroup_network" },
])

export default BargainingGroup
