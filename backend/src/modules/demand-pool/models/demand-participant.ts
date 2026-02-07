import { model } from "@medusajs/framework/utils"

export enum ParticipantStatus {
  COMMITTED = "COMMITTED",
  ESCROWED = "ESCROWED",
  CONFIRMED = "CONFIRMED",
  WITHDRAWN = "WITHDRAWN",
  REFUNDED = "REFUNDED",
}

const DemandParticipant = model.define("demand_participant", {
  id: model.id().primaryKey(),

  demand_post_id: model.text(),
  customer_id: model.text(),

  // Commitment
  quantity_committed: model.number(),
  price_willing_to_pay: model.bigNumber().nullable(),

  // Escrow
  escrow_amount: model.bigNumber().default(0),
  escrow_locked: model.boolean().default(false),
  ledger_entry_id: model.text().nullable(),

  status: model
    .enum(Object.values(ParticipantStatus))
    .default(ParticipantStatus.COMMITTED),

  // Voting weight (proportional to quantity)
  vote_weight: model.float().default(1),

  joined_at: model.dateTime(),
  escrowed_at: model.dateTime().nullable(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["demand_post_id"], name: "IDX_participant_demand_post" },
  { on: ["customer_id"], name: "IDX_participant_customer" },
  {
    on: ["demand_post_id", "customer_id"],
    name: "IDX_participant_demand_customer",
    unique: true,
  },
  { on: ["status"], name: "IDX_participant_status" },
])

export default DemandParticipant
