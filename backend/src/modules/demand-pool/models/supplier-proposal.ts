import { model } from "@medusajs/framework/utils"

export enum ProposalStatus {
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  SHORTLISTED = "SHORTLISTED",
  COUNTER_OFFERED = "COUNTER_OFFERED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

const SupplierProposal = model.define("supplier_proposal", {
  id: model.id().primaryKey(),

  demand_post_id: model.text(),
  supplier_id: model.text(),

  // Pricing
  unit_price: model.bigNumber(),
  currency_code: model.text().default("USD"),
  min_quantity: model.number(),
  max_quantity: model.number().nullable(),

  // Volume tiers: [{ min_qty, max_qty, unit_price }]
  volume_tiers: model.json().nullable(),

  // Fulfillment
  fulfillment_timeline_days: model.number().nullable(),
  delivery_method: model.text().nullable(),
  delivery_cost: model.bigNumber().nullable(),

  // Compliance
  certifications: model.json().nullable(),
  compliance_notes: model.text().nullable(),

  // Terms
  payment_terms: model.text().nullable(),
  notes: model.text().nullable(),

  // Counter-offer from buyers
  counter_offer: model.json().nullable(),
  counter_offer_at: model.dateTime().nullable(),

  // Voting results
  votes_for: model.number().default(0),
  votes_against: model.number().default(0),
  vote_weight_for: model.float().default(0),
  vote_weight_against: model.float().default(0),

  status: model
    .enum(Object.values(ProposalStatus))
    .default(ProposalStatus.SUBMITTED),

  submitted_at: model.dateTime(),
  reviewed_at: model.dateTime().nullable(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["demand_post_id"], name: "IDX_proposal_demand_post" },
  { on: ["supplier_id"], name: "IDX_proposal_supplier" },
  { on: ["status"], name: "IDX_proposal_status" },
  {
    on: ["demand_post_id", "supplier_id"],
    name: "IDX_proposal_demand_supplier",
  },
])

export default SupplierProposal
