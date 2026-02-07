import { model } from "@medusajs/framework/utils"

const BargainingVote = model.define("bargaining_vote", {
  id: model.id().primaryKey(),

  proposal_id: model.text(),
  group_id: model.text(),
  voter_id: model.text(),

  vote: model.enum(["FOR", "AGAINST", "ABSTAIN"]),
  weight: model.float().default(1),
  comment: model.text().nullable(),

  voted_at: model.dateTime(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["proposal_id"], name: "IDX_bvote_proposal" },
  { on: ["voter_id"], name: "IDX_bvote_voter" },
  {
    on: ["proposal_id", "voter_id"],
    name: "IDX_bvote_proposal_voter",
    unique: true,
  },
  { on: ["group_id"], name: "IDX_bvote_group" },
])

export default BargainingVote
