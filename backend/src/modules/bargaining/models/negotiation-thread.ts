import { model } from "@medusajs/framework/utils"

const NegotiationThread = model.define("negotiation_thread", {
  id: model.id().primaryKey(),

  group_id: model.text(),
  proposal_id: model.text().nullable(),
  author_id: model.text(),
  author_type: model.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),

  message: model.text(),
  message_type: model.enum(["COMMENT", "COUNTER", "QUESTION", "UPDATE", "SYSTEM"]).default("COMMENT"),

  // Thread hierarchy
  parent_message_id: model.text().nullable(),

  // Attachments
  attachment_urls: model.json().nullable(),

  posted_at: model.dateTime(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["group_id"], name: "IDX_nthread_group" },
  { on: ["proposal_id"], name: "IDX_nthread_proposal" },
  { on: ["author_id"], name: "IDX_nthread_author" },
  { on: ["parent_message_id"], name: "IDX_nthread_parent" },
])

export default NegotiationThread
