import { MedusaService } from "@medusajs/framework/utils"
import {
  BargainingGroup,
  BargainingMember,
  BargainingProposal,
  BargainingVote,
  NegotiationThread,
} from "./models"
import { BargainingGroupStatus } from "./models/bargaining-group"
import { MemberRole, MemberStatus } from "./models/bargaining-member"
import { BargainingProposalStatus } from "./models/bargaining-proposal"

class BargainingModuleService extends MedusaService({
  BargainingGroup,
  BargainingMember,
  BargainingProposal,
  BargainingVote,
  NegotiationThread,
}) {
  // ──────────────────────────────────────────────────────────────────────────
  // Status transitions
  // ──────────────────────────────────────────────────────────────────────────

  private readonly GROUP_TRANSITIONS: Record<string, string[]> = {
    [BargainingGroupStatus.FORMING]: [
      BargainingGroupStatus.OPEN,
      BargainingGroupStatus.DISBANDED,
    ],
    [BargainingGroupStatus.OPEN]: [
      BargainingGroupStatus.NEGOTIATING,
      BargainingGroupStatus.DISBANDED,
    ],
    [BargainingGroupStatus.NEGOTIATING]: [
      BargainingGroupStatus.TERMS_AGREED,
      BargainingGroupStatus.OPEN,
      BargainingGroupStatus.DISBANDED,
    ],
    [BargainingGroupStatus.TERMS_AGREED]: [
      BargainingGroupStatus.COMPLETED,
      BargainingGroupStatus.NEGOTIATING,
    ],
    [BargainingGroupStatus.COMPLETED]: [],
    [BargainingGroupStatus.DISBANDED]: [],
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Group Operations
  // ──────────────────────────────────────────────────────────────────────────

  async createGroup(input: {
    name: string
    description?: string
    category?: string
    organizer_id: string
    organizer_type?: string
    common_requirements?: Record<string, unknown>
    delivery_specs?: Record<string, unknown>
    payment_terms?: Record<string, unknown>
    quality_standards?: Record<string, unknown>
    voting_rule?: string
    approval_threshold?: number
    min_members?: number
    max_members?: number
    currency_code?: string
    demand_post_id?: string
    buyer_network_id?: string
    negotiation_deadline?: Date
    metadata?: Record<string, unknown>
  }) {
    const [group] = await this.createBargainingGroups([
      {
        ...input,
        status: BargainingGroupStatus.FORMING,
        member_count: 1,
        total_quantity: 0,
        total_budget: 0,
      },
    ])

    // Add organizer as first member
    await this.createBargainingMembers([
      {
        group_id: group.id,
        customer_id: input.organizer_id,
        role: MemberRole.ORGANIZER,
        status: MemberStatus.ACTIVE,
        vote_weight: 1,
        joined_at: new Date(),
      },
    ])

    return group
  }

  async transitionGroupStatus(id: string, newStatus: string) {
    const groups = await this.listBargainingGroups({ id })
    if (groups.length === 0) {
      throw new Error(`Bargaining group ${id} not found`)
    }

    const group = groups[0]
    const validTargets = this.GROUP_TRANSITIONS[group.status] || []
    if (!validTargets.includes(newStatus)) {
      throw new Error(
        `Cannot transition group from "${group.status}" to "${newStatus}". ` +
          `Valid: ${validTargets.join(", ") || "none (terminal)"}`
      )
    }

    if (
      newStatus === BargainingGroupStatus.OPEN &&
      Number(group.member_count) < Number(group.min_members)
    ) {
      throw new Error(
        `Need at least ${group.min_members} members to open group. Current: ${group.member_count}`
      )
    }

    const updateData: Record<string, unknown> = {
      id,
      status: newStatus,
    }
    if (newStatus === BargainingGroupStatus.OPEN) {
      updateData.formed_at = new Date()
    }

    await this.updateBargainingGroups(updateData)
    const [updated] = await this.listBargainingGroups({ id })
    return updated
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Member Operations
  // ──────────────────────────────────────────────────────────────────────────

  async joinGroup(input: {
    group_id: string
    customer_id: string
    quantity_needed?: number
    budget?: number
    specific_requirements?: Record<string, unknown>
  }) {
    const groups = await this.listBargainingGroups({ id: input.group_id })
    if (groups.length === 0) {
      throw new Error("Bargaining group not found")
    }

    const group = groups[0]
    if (
      group.status !== BargainingGroupStatus.FORMING &&
      group.status !== BargainingGroupStatus.OPEN
    ) {
      throw new Error(`Cannot join group with status "${group.status}"`)
    }

    if (
      group.max_members &&
      Number(group.member_count) >= Number(group.max_members)
    ) {
      throw new Error("Group is at maximum capacity")
    }

    // Check for existing membership
    const existing = await this.listBargainingMembers({
      group_id: input.group_id,
      customer_id: input.customer_id,
    })
    if (existing.length > 0 && existing[0].status === MemberStatus.ACTIVE) {
      throw new Error("Already a member of this group")
    }

    const weight =
      group.voting_rule === "WEIGHTED_BY_QUANTITY"
        ? input.quantity_needed || 1
        : 1

    const [member] = await this.createBargainingMembers([
      {
        group_id: input.group_id,
        customer_id: input.customer_id,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACTIVE,
        quantity_needed: input.quantity_needed || 0,
        budget: input.budget || 0,
        specific_requirements: input.specific_requirements,
        vote_weight: weight,
        joined_at: new Date(),
      },
    ])

    // Update group aggregates
    await this.updateBargainingGroups({
      id: input.group_id,
      member_count: Number(group.member_count) + 1,
      total_quantity:
        Number(group.total_quantity) + (input.quantity_needed || 0),
      total_budget: Number(group.total_budget) + (input.budget || 0),
    })

    return member
  }

  async leaveGroup(groupId: string, customerId: string) {
    const members = await this.listBargainingMembers({
      group_id: groupId,
      customer_id: customerId,
    })
    if (members.length === 0 || members[0].status !== MemberStatus.ACTIVE) {
      throw new Error("Not an active member of this group")
    }

    const member = members[0]
    if (member.role === MemberRole.ORGANIZER) {
      throw new Error("Organizer cannot leave the group. Transfer or disband instead.")
    }

    await this.updateBargainingMembers({
      id: member.id,
      status: MemberStatus.LEFT,
    })

    const groups = await this.listBargainingGroups({ id: groupId })
    if (groups.length > 0) {
      const group = groups[0]
      await this.updateBargainingGroups({
        id: groupId,
        member_count: Math.max(0, Number(group.member_count) - 1),
        total_quantity: Math.max(
          0,
          Number(group.total_quantity) - Number(member.quantity_needed)
        ),
        total_budget: Math.max(
          0,
          Number(group.total_budget) - Number(member.budget)
        ),
      })
    }

    return member
  }

  async promoteMember(groupId: string, memberId: string, newRole: string) {
    const members = await this.listBargainingMembers({ id: memberId })
    if (members.length === 0 || members[0].group_id !== groupId) {
      throw new Error("Member not found in this group")
    }

    await this.updateBargainingMembers({
      id: memberId,
      role: newRole,
    })

    const [updated] = await this.listBargainingMembers({ id: memberId })
    return updated
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Proposal Operations
  // ──────────────────────────────────────────────────────────────────────────

  async submitGroupProposal(input: {
    group_id: string
    proposer_id: string
    proposer_type?: string
    proposal_type?: string
    title: string
    description?: string
    terms: Record<string, unknown>
    unit_price?: number
    total_price?: number
    volume_tiers?: Array<{
      min_qty: number
      max_qty: number
      unit_price: number
    }>
    fulfillment_timeline?: string
    valid_until?: Date
    parent_proposal_id?: string
    metadata?: Record<string, unknown>
  }) {
    const groups = await this.listBargainingGroups({ id: input.group_id })
    if (groups.length === 0) {
      throw new Error("Bargaining group not found")
    }

    const group = groups[0]
    if (
      group.status !== BargainingGroupStatus.OPEN &&
      group.status !== BargainingGroupStatus.NEGOTIATING
    ) {
      throw new Error(
        `Cannot submit proposals to group with status "${group.status}"`
      )
    }

    const [proposal] = await this.createBargainingProposals([
      {
        group_id: input.group_id,
        proposer_id: input.proposer_id,
        proposer_type: input.proposer_type || "SELLER",
        proposal_type: input.proposal_type || "SUPPLIER_OFFER",
        title: input.title,
        description: input.description,
        terms: input.terms,
        unit_price: input.unit_price,
        total_price: input.total_price,
        volume_tiers: input.volume_tiers,
        fulfillment_timeline: input.fulfillment_timeline,
        valid_until: input.valid_until,
        parent_proposal_id: input.parent_proposal_id,
        status: BargainingProposalStatus.SUBMITTED,
        submitted_at: new Date(),
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        total_vote_weight: 0,
      },
    ])

    // Auto-transition group to NEGOTIATING if first proposal
    if (group.status === BargainingGroupStatus.OPEN) {
      await this.updateBargainingGroups({
        id: input.group_id,
        status: BargainingGroupStatus.NEGOTIATING,
      })
    }

    return proposal
  }

  async counterOfferGroupProposal(
    proposalId: string,
    counteredById: string,
    counterTerms: Record<string, unknown>
  ) {
    const proposals = await this.listBargainingProposals({ id: proposalId })
    if (proposals.length === 0) {
      throw new Error("Proposal not found")
    }

    const proposal = proposals[0]

    await this.updateBargainingProposals({
      id: proposalId,
      counter_terms: counterTerms,
      status: BargainingProposalStatus.COUNTER_OFFERED,
    })

    // Create counter-proposal as new entry
    const [counter] = await this.createBargainingProposals([
      {
        group_id: proposal.group_id,
        proposer_id: counteredById,
        proposer_type: "CUSTOMER",
        proposal_type: "BUYER_COUNTER",
        title: `Counter to: ${proposal.title}`,
        terms: counterTerms,
        parent_proposal_id: proposalId,
        status: BargainingProposalStatus.SUBMITTED,
        submitted_at: new Date(),
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        total_vote_weight: 0,
      },
    ])

    return counter
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Voting
  // ──────────────────────────────────────────────────────────────────────────

  async voteOnGroupProposal(input: {
    proposal_id: string
    group_id: string
    voter_id: string
    vote: "FOR" | "AGAINST" | "ABSTAIN"
    comment?: string
  }) {
    // Verify voter is an active member
    const members = await this.listBargainingMembers({
      group_id: input.group_id,
      customer_id: input.voter_id,
    })
    if (members.length === 0 || members[0].status !== MemberStatus.ACTIVE) {
      throw new Error("Only active members can vote")
    }

    // Check for existing vote
    const existingVotes = await this.listBargainingVotes({
      proposal_id: input.proposal_id,
      voter_id: input.voter_id,
    })
    if (existingVotes.length > 0) {
      throw new Error("Already voted on this proposal")
    }

    const member = members[0]
    const weight = Number(member.vote_weight) || 1

    const [vote] = await this.createBargainingVotes([
      {
        proposal_id: input.proposal_id,
        group_id: input.group_id,
        voter_id: input.voter_id,
        vote: input.vote,
        weight,
        comment: input.comment,
        voted_at: new Date(),
      },
    ])

    // Update proposal vote counts
    const proposals = await this.listBargainingProposals({
      id: input.proposal_id,
    })
    if (proposals.length > 0) {
      const proposal = proposals[0]
      const updateData: Record<string, unknown> = {
        id: input.proposal_id,
        total_vote_weight:
          Number(proposal.total_vote_weight) + weight,
      }

      if (input.vote === "FOR") {
        updateData.votes_for = Number(proposal.votes_for) + 1
      } else if (input.vote === "AGAINST") {
        updateData.votes_against = Number(proposal.votes_against) + 1
      } else {
        updateData.votes_abstain = Number(proposal.votes_abstain) + 1
      }

      await this.updateBargainingProposals(updateData)
    }

    return vote
  }

  async finalizeProposalVote(proposalId: string) {
    const proposals = await this.listBargainingProposals({ id: proposalId })
    if (proposals.length === 0) {
      throw new Error("Proposal not found")
    }

    const proposal = proposals[0]
    const groups = await this.listBargainingGroups({ id: proposal.group_id })
    if (groups.length === 0) {
      throw new Error("Bargaining group not found")
    }

    const group = groups[0]
    const totalVotes =
      Number(proposal.votes_for) +
      Number(proposal.votes_against) +
      Number(proposal.votes_abstain)

    if (totalVotes === 0) {
      throw new Error("No votes have been cast")
    }

    // Calculate approval based on non-abstain votes
    const decidingVotes =
      Number(proposal.votes_for) + Number(proposal.votes_against)
    const approvalPct =
      decidingVotes > 0
        ? (Number(proposal.votes_for) / decidingVotes) * 100
        : 0

    const threshold = Number(group.approval_threshold) || 51
    const accepted = approvalPct >= threshold

    await this.updateBargainingProposals({
      id: proposalId,
      approval_percentage: approvalPct,
      status: accepted
        ? BargainingProposalStatus.ACCEPTED
        : BargainingProposalStatus.REJECTED,
      voted_at: new Date(),
      resolved_at: new Date(),
    })

    // If accepted, update group status
    if (accepted) {
      await this.updateBargainingGroups({
        id: proposal.group_id,
        status: BargainingGroupStatus.TERMS_AGREED,
      })
    }

    return {
      proposal_id: proposalId,
      approval_percentage: approvalPct,
      accepted,
      votes_for: Number(proposal.votes_for),
      votes_against: Number(proposal.votes_against),
      votes_abstain: Number(proposal.votes_abstain),
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Negotiation Thread
  // ──────────────────────────────────────────────────────────────────────────

  async postMessage(input: {
    group_id: string
    proposal_id?: string
    author_id: string
    author_type?: string
    message: string
    message_type?: string
    parent_message_id?: string
    attachment_urls?: string[]
  }) {
    const [thread] = await this.createNegotiationThreads([
      {
        group_id: input.group_id,
        proposal_id: input.proposal_id,
        author_id: input.author_id,
        author_type: input.author_type || "CUSTOMER",
        message: input.message,
        message_type: input.message_type || "COMMENT",
        parent_message_id: input.parent_message_id,
        attachment_urls: input.attachment_urls,
        posted_at: new Date(),
      },
    ])

    return thread
  }

  async getThreads(groupId: string, proposalId?: string) {
    const filters: Record<string, unknown> = { group_id: groupId }
    if (proposalId) {
      filters.proposal_id = proposalId
    }

    const threads = await this.listNegotiationThreads(filters, {
      order: { posted_at: "ASC" },
    })

    return threads
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Query Helpers
  // ──────────────────────────────────────────────────────────────────────────

  async getGroupDetails(groupId: string) {
    const groups = await this.listBargainingGroups({ id: groupId })
    if (groups.length === 0) {
      throw new Error("Bargaining group not found")
    }

    const [members, proposals, threads] = await Promise.all([
      this.listBargainingMembers({ group_id: groupId }),
      this.listBargainingProposals({ group_id: groupId }),
      this.listNegotiationThreads({ group_id: groupId }),
    ])

    const activeMembers = members.filter(
      (m) => m.status === MemberStatus.ACTIVE
    )

    return {
      ...groups[0],
      members: {
        total: activeMembers.length,
        list: activeMembers,
      },
      proposals: {
        total: proposals.length,
        active: proposals.filter(
          (p) =>
            p.status === BargainingProposalStatus.SUBMITTED ||
            p.status === BargainingProposalStatus.UNDER_REVIEW
        ).length,
        accepted: proposals.filter(
          (p) => p.status === BargainingProposalStatus.ACCEPTED
        ).length,
        list: proposals,
      },
      threads: {
        total: threads.length,
        list: threads.slice(-50),
      },
    }
  }

  async getOpenGroups(filters?: {
    category?: string
    limit?: number
    offset?: number
  }) {
    const queryFilters: Record<string, unknown> = {
      status: [
        BargainingGroupStatus.FORMING,
        BargainingGroupStatus.OPEN,
      ],
    }
    if (filters?.category) {
      queryFilters.category = filters.category
    }

    return this.listBargainingGroups(queryFilters, {
      skip: filters?.offset || 0,
      take: filters?.limit || 20,
      order: { created_at: "DESC" },
    })
  }

  async getMyGroups(customerId: string) {
    const memberships = await this.listBargainingMembers({
      customer_id: customerId,
      status: MemberStatus.ACTIVE,
    })

    if (memberships.length === 0) return []

    const groupIds = memberships.map((m) => m.group_id)
    const groups = await this.listBargainingGroups({
      id: groupIds,
    })

    return groups.map((g) => ({
      ...g,
      my_role: memberships.find((m) => m.group_id === g.id)?.role,
    }))
  }
}

export default BargainingModuleService
