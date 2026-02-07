import { model } from "@medusajs/framework/utils"

export enum MemberRole {
  ORGANIZER = "ORGANIZER",
  NEGOTIATOR = "NEGOTIATOR",
  MEMBER = "MEMBER",
  OBSERVER = "OBSERVER",
}

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  LEFT = "LEFT",
  REMOVED = "REMOVED",
}

const BargainingMember = model.define("bargaining_member", {
  id: model.id().primaryKey(),

  group_id: model.text(),
  customer_id: model.text(),

  role: model.enum(Object.values(MemberRole)).default(MemberRole.MEMBER),
  status: model
    .enum(Object.values(MemberStatus))
    .default(MemberStatus.ACTIVE),

  // Member's demand
  quantity_needed: model.number().default(0),
  budget: model.bigNumber().default(0),
  specific_requirements: model.json().nullable(),

  // Voting
  vote_weight: model.float().default(1),

  joined_at: model.dateTime(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["group_id"], name: "IDX_bmember_group" },
  { on: ["customer_id"], name: "IDX_bmember_customer" },
  {
    on: ["group_id", "customer_id"],
    name: "IDX_bmember_group_customer",
    unique: true,
  },
  { on: ["role"], name: "IDX_bmember_role" },
])

export default BargainingMember
