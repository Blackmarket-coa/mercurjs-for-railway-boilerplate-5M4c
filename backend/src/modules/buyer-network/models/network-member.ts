import { model } from "@medusajs/framework/utils"

export enum NetworkMemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER",
}

export enum NetworkMemberStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
  LEFT = "LEFT",
}

const NetworkMember = model.define("network_member", {
  id: model.id().primaryKey(),

  network_id: model.text(),
  customer_id: model.text(),

  role: model
    .enum(Object.values(NetworkMemberRole))
    .default(NetworkMemberRole.MEMBER),
  status: model
    .enum(Object.values(NetworkMemberStatus))
    .default(NetworkMemberStatus.ACTIVE),

  // Member profile within network
  display_name: model.text().nullable(),
  business_name: model.text().nullable(),
  business_type: model.text().nullable(),

  // Engagement metrics
  group_buys_joined: model.number().default(0),
  total_savings: model.bigNumber().default(0),
  reputation_score: model.float().default(0),
  referral_count: model.number().default(0),

  // Rewards
  reward_points: model.number().default(0),

  joined_at: model.dateTime(),
  approved_at: model.dateTime().nullable(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["network_id"], name: "IDX_nmember_network" },
  { on: ["customer_id"], name: "IDX_nmember_customer" },
  {
    on: ["network_id", "customer_id"],
    name: "IDX_nmember_network_customer",
    unique: true,
  },
  { on: ["status"], name: "IDX_nmember_status" },
  { on: ["reputation_score"], name: "IDX_nmember_reputation" },
])

export default NetworkMember
