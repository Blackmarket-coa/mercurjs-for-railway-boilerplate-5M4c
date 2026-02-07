import { model } from "@medusajs/framework/utils"

export enum BargainingProposalStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  COUNTER_OFFERED = "COUNTER_OFFERED",
  VOTED_ON = "VOTED_ON",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum BargainingProposalType {
  SUPPLIER_OFFER = "SUPPLIER_OFFER",
  BUYER_COUNTER = "BUYER_COUNTER",
  SPEC_CHANGE = "SPEC_CHANGE",
  TERMS_AMENDMENT = "TERMS_AMENDMENT",
}

const BargainingProposal = model.define("bargaining_proposal", {
  id: model.id().primaryKey(),

  group_id: model.text(),
  proposer_id: model.text(),
  proposer_type: model.enum(["CUSTOMER", "SELLER"]).default("SELLER"),

  proposal_type: model
    .enum(Object.values(BargainingProposalType))
    .default(BargainingProposalType.SUPPLIER_OFFER),

  // Proposal content
  title: model.text(),
  description: model.text().nullable(),
  terms: model.json(),

  // Pricing
  unit_price: model.bigNumber().nullable(),
  total_price: model.bigNumber().nullable(),
  volume_tiers: model.json().nullable(),

  // Timeline
  fulfillment_timeline: model.text().nullable(),
  valid_until: model.dateTime().nullable(),

  // Counter-offer chain
  parent_proposal_id: model.text().nullable(),
  counter_terms: model.json().nullable(),

  // Voting results
  votes_for: model.number().default(0),
  votes_against: model.number().default(0),
  votes_abstain: model.number().default(0),
  total_vote_weight: model.float().default(0),
  approval_percentage: model.float().nullable(),

  status: model
    .enum(Object.values(BargainingProposalStatus))
    .default(BargainingProposalStatus.DRAFT),

  submitted_at: model.dateTime().nullable(),
  voted_at: model.dateTime().nullable(),
  resolved_at: model.dateTime().nullable(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["group_id"], name: "IDX_bproposal_group" },
  { on: ["proposer_id"], name: "IDX_bproposal_proposer" },
  { on: ["status"], name: "IDX_bproposal_status" },
  { on: ["parent_proposal_id"], name: "IDX_bproposal_parent" },
  { on: ["proposal_type"], name: "IDX_bproposal_type" },
])

export default BargainingProposal
