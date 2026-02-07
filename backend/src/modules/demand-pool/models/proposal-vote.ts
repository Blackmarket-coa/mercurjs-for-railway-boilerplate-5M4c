import { model } from "@medusajs/framework/utils"

const ProposalVote = model.define("proposal_vote", {
  id: model.id().primaryKey(),

  proposal_id: model.text(),
  demand_post_id: model.text(),
  voter_id: model.text(),

  vote: model.enum(["FOR", "AGAINST", "ABSTAIN"]),
  weight: model.float().default(1),
  comment: model.text().nullable(),

  voted_at: model.dateTime(),

  metadata: model.json().nullable(),
}).indexes([
  { on: ["proposal_id"], name: "IDX_pvote_proposal" },
  { on: ["voter_id"], name: "IDX_pvote_voter" },
  {
    on: ["proposal_id", "voter_id"],
    name: "IDX_pvote_proposal_voter",
    unique: true,
  },
])

export default ProposalVote
