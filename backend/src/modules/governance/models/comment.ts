import { model } from "@medusajs/framework/utils"

/**
 * Proposal Comment Model
 * 
 * Discussion comments on proposals.
 */
export const ProposalComment = model.define("garden_proposal_comment", {
  id: model.id().primaryKey(),
  proposal_id: model.text(),
  garden_id: model.text(),
  customer_id: model.text(),
  
  // Content
  content: model.text(),
  
  // Reply to another comment
  parent_id: model.text().nullable(),
  
  // Visibility
  visibility: model.enum(["public", "members_only"]).default("members_only"),
  
  // Moderation
  status: model.enum(["visible", "hidden", "flagged", "removed"]).default("visible"),
  moderated_by_id: model.text().nullable(),
  moderation_reason: model.text().nullable(),
  
  // Reactions (denormalized)
  likes_count: model.number().default(0),
  
  // Edits
  is_edited: model.boolean().default(false),
  edited_at: model.dateTime().nullable(),
  
  posted_at: model.dateTime(),
  
  metadata: model.json().nullable(),
})
