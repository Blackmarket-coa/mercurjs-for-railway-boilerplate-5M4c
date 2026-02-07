/**
 * Collective Purchase Hawala Integration
 *
 * Bridges the demand-pool and bargaining modules with the Hawala ledger
 * for escrow management, bounty payouts, and group payment processing.
 */

import type HawalaLedgerModuleService from "../modules/hawala-ledger/service"
import type DemandPoolModuleService from "../modules/demand-pool/service"
import { ParticipantStatus } from "../modules/demand-pool/models/demand-participant"
import { DemandPostStatus } from "../modules/demand-pool/models/demand-post"

export class CollectiveHawalaService {
  private hawalaService: HawalaLedgerModuleService
  private demandPoolService: DemandPoolModuleService

  constructor(
    hawalaService: HawalaLedgerModuleService,
    demandPoolService: DemandPoolModuleService
  ) {
    this.hawalaService = hawalaService
    this.demandPoolService = demandPoolService
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Escrow for Demand Pool Participants
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Lock funds in escrow when a buyer commits to a demand pool.
   * Moves funds from the buyer's wallet to the demand pool's escrow account.
   */
  async escrowParticipantFunds(input: {
    demand_post_id: string
    participant_id: string
    customer_id: string
    amount: number
  }) {
    // Get or create escrow account for this demand pool
    const escrowAccount = await this.getOrCreateDemandEscrow(
      input.demand_post_id
    )

    // Get customer's wallet
    const customerAccounts = await this.hawalaService.listLedgerAccounts({
      owner_type: "CUSTOMER",
      owner_id: input.customer_id,
      account_type: "USER_WALLET",
    })

    if (customerAccounts.length === 0) {
      throw new Error("Customer wallet not found")
    }

    const customerAccount = customerAccounts[0]
    if (Number(customerAccount.available_balance) < input.amount) {
      throw new Error(
        `Insufficient balance. Available: ${customerAccount.available_balance}, Required: ${input.amount}`
      )
    }

    // Transfer to escrow
    const entry = await this.hawalaService.createTransfer({
      debit_account_id: customerAccount.id,
      credit_account_id: escrowAccount.id,
      amount: input.amount,
      entry_type: "PURCHASE",
      description: `Escrow for demand pool ${input.demand_post_id}`,
      reference_type: "ORDER",
      reference_id: input.demand_post_id,
      idempotency_key: `demand-escrow-${input.participant_id}`,
    })

    // Update participant record
    await this.demandPoolService.updateDemandParticipants({
      id: input.participant_id,
      escrow_amount: input.amount,
      escrow_locked: true,
      ledger_entry_id: entry.id,
      status: ParticipantStatus.ESCROWED,
      escrowed_at: new Date(),
    })

    // Update demand post total escrowed
    const posts = await this.demandPoolService.listDemandPosts({
      id: input.demand_post_id,
    })
    if (posts.length > 0) {
      await this.demandPoolService.updateDemandPosts({
        id: input.demand_post_id,
        total_escrowed:
          Number(posts[0].total_escrowed) + input.amount,
        escrow_account_id: escrowAccount.id,
      })
    }

    return entry
  }

  /**
   * Release escrowed funds back to participants (e.g., on cancellation).
   */
  async releaseParticipantEscrow(input: {
    demand_post_id: string
    participant_id: string
    customer_id: string
  }) {
    const participants = await this.demandPoolService.listDemandParticipants({
      id: input.participant_id,
    })
    if (participants.length === 0) {
      throw new Error("Participant not found")
    }

    const participant = participants[0]
    if (!participant.escrow_locked || Number(participant.escrow_amount) === 0) {
      throw new Error("No escrowed funds to release")
    }

    const posts = await this.demandPoolService.listDemandPosts({
      id: input.demand_post_id,
    })
    if (posts.length === 0) {
      throw new Error("Demand post not found")
    }

    const escrowAccountId = posts[0].escrow_account_id as string
    if (!escrowAccountId) {
      throw new Error("Escrow account not found")
    }

    // Get customer wallet
    const customerAccounts = await this.hawalaService.listLedgerAccounts({
      owner_type: "CUSTOMER",
      owner_id: input.customer_id,
      account_type: "USER_WALLET",
    })

    if (customerAccounts.length === 0) {
      throw new Error("Customer wallet not found")
    }

    const amount = Number(participant.escrow_amount)

    // Refund from escrow to customer
    const entry = await this.hawalaService.createTransfer({
      debit_account_id: escrowAccountId,
      credit_account_id: customerAccounts[0].id,
      amount,
      entry_type: "REFUND",
      description: `Escrow release for demand pool ${input.demand_post_id}`,
      reference_type: "ORDER",
      reference_id: input.demand_post_id,
      idempotency_key: `demand-release-${input.participant_id}`,
    })

    // Update participant
    await this.demandPoolService.updateDemandParticipants({
      id: input.participant_id,
      escrow_amount: 0,
      escrow_locked: false,
      status: ParticipantStatus.REFUNDED,
    })

    // Update demand post
    await this.demandPoolService.updateDemandPosts({
      id: input.demand_post_id,
      total_escrowed: Math.max(
        0,
        Number(posts[0].total_escrowed) - amount
      ),
    })

    return entry
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Bounty Escrow & Payouts
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Escrow bounty funds when a buyer creates a demand bounty.
   */
  async escrowBountyFunds(input: {
    demand_post_id: string
    bounty_id: string
    contributor_id: string
    amount: number
  }) {
    const escrowAccount = await this.getOrCreateDemandEscrow(
      input.demand_post_id
    )

    const contributorAccounts =
      await this.hawalaService.listLedgerAccounts({
        owner_id: input.contributor_id,
        account_type: "USER_WALLET",
      })

    if (contributorAccounts.length === 0) {
      throw new Error("Contributor wallet not found")
    }

    const contributorAccount = contributorAccounts[0]
    if (Number(contributorAccount.available_balance) < input.amount) {
      throw new Error("Insufficient balance for bounty escrow")
    }

    const entry = await this.hawalaService.createTransfer({
      debit_account_id: contributorAccount.id,
      credit_account_id: escrowAccount.id,
      amount: input.amount,
      entry_type: "FEE",
      description: `Bounty escrow for demand pool ${input.demand_post_id}`,
      reference_type: "ORDER",
      reference_id: input.demand_post_id,
      idempotency_key: `bounty-escrow-${input.bounty_id}`,
    })

    // Update bounty record
    await this.demandPoolService.updateDemandBounties({
      id: input.bounty_id,
      escrowed: true,
      escrow_ledger_entry_id: entry.id,
    })

    return entry
  }

  /**
   * Pay out a bounty milestone to the assignee.
   */
  async payBountyMilestone(input: {
    demand_post_id: string
    bounty_id: string
    assignee_id: string
    amount: number
    milestone_description: string
  }) {
    const posts = await this.demandPoolService.listDemandPosts({
      id: input.demand_post_id,
    })
    if (posts.length === 0) {
      throw new Error("Demand post not found")
    }

    const escrowAccountId = posts[0].escrow_account_id as string
    if (!escrowAccountId) {
      throw new Error("Escrow account not found")
    }

    // Get assignee wallet (could be customer or seller)
    let assigneeAccounts = await this.hawalaService.listLedgerAccounts({
      owner_id: input.assignee_id,
      account_type: "USER_WALLET",
    })

    if (assigneeAccounts.length === 0) {
      assigneeAccounts = await this.hawalaService.listLedgerAccounts({
        owner_id: input.assignee_id,
        account_type: "SELLER_EARNINGS",
      })
    }

    if (assigneeAccounts.length === 0) {
      throw new Error("Assignee account not found")
    }

    const entry = await this.hawalaService.createTransfer({
      debit_account_id: escrowAccountId,
      credit_account_id: assigneeAccounts[0].id,
      amount: input.amount,
      entry_type: "TRANSFER",
      description: `Bounty payout: ${input.milestone_description}`,
      reference_type: "ORDER",
      reference_id: input.demand_post_id,
      idempotency_key: `bounty-payout-${input.bounty_id}-${Date.now()}`,
    })

    return entry
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Group Payment Processing
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Process the final group purchase when deal is approved.
   * Moves funds from escrow to the selected supplier.
   */
  async processGroupPurchase(input: {
    demand_post_id: string
    supplier_id: string
    total_amount: number
    platform_fee_percentage: number
  }) {
    const posts = await this.demandPoolService.listDemandPosts({
      id: input.demand_post_id,
    })
    if (posts.length === 0) {
      throw new Error("Demand post not found")
    }

    const post = posts[0]
    const escrowAccountId = post.escrow_account_id as string
    if (!escrowAccountId) {
      throw new Error("Escrow account not set")
    }

    // Get supplier earnings account
    const supplierAccounts = await this.hawalaService.listLedgerAccounts({
      owner_type: "SELLER",
      owner_id: input.supplier_id,
      account_type: "SELLER_EARNINGS",
    })

    if (supplierAccounts.length === 0) {
      throw new Error("Supplier earnings account not found")
    }

    const platformFee = Math.floor(
      input.total_amount * (input.platform_fee_percentage / 100)
    )
    const supplierAmount = input.total_amount - platformFee

    const entries: any[] = []

    // Platform fee
    const platformAccount =
      await this.hawalaService.getOrCreateSystemAccount("PLATFORM_FEE")
    const feeEntry = await this.hawalaService.createTransfer({
      debit_account_id: escrowAccountId,
      credit_account_id: platformAccount.id,
      amount: platformFee,
      entry_type: "COMMISSION",
      description: `Platform fee for group purchase ${input.demand_post_id}`,
      reference_type: "ORDER",
      reference_id: input.demand_post_id,
      idempotency_key: `group-purchase-fee-${input.demand_post_id}`,
    })
    entries.push(feeEntry)

    // Supplier payment
    const supplierEntry = await this.hawalaService.createTransfer({
      debit_account_id: escrowAccountId,
      credit_account_id: supplierAccounts[0].id,
      amount: supplierAmount,
      entry_type: "TRANSFER",
      description: `Group purchase payment for demand ${input.demand_post_id}`,
      reference_type: "ORDER",
      reference_id: input.demand_post_id,
      idempotency_key: `group-purchase-supplier-${input.demand_post_id}`,
    })
    entries.push(supplierEntry)

    // Update demand post status
    await this.demandPoolService.updateDemandPosts({
      id: input.demand_post_id,
      status: DemandPostStatus.ORDER_PLACED,
    })

    return {
      entries,
      platform_fee: platformFee,
      supplier_amount: supplierAmount,
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Savings Dashboard
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Calculate savings for a completed group buy compared to list price.
   */
  async calculateSavings(demandPostId: string) {
    const posts = await this.demandPoolService.listDemandPosts({
      id: demandPostId,
    })
    if (posts.length === 0) {
      throw new Error("Demand post not found")
    }

    const post = posts[0]
    if (!post.target_price || !post.final_unit_price) {
      return {
        demand_post_id: demandPostId,
        savings_per_unit: 0,
        total_savings: 0,
        savings_percentage: 0,
      }
    }

    const targetPrice = Number(post.target_price)
    const finalPrice = Number(post.final_unit_price)
    const quantity = Number(post.committed_quantity)

    const savingsPerUnit = Math.max(0, targetPrice - finalPrice)
    const totalSavings = savingsPerUnit * quantity
    const savingsPercentage =
      targetPrice > 0
        ? ((targetPrice - finalPrice) / targetPrice) * 100
        : 0

    return {
      demand_post_id: demandPostId,
      target_price: targetPrice,
      final_price: finalPrice,
      quantity,
      savings_per_unit: savingsPerUnit,
      total_savings: totalSavings,
      savings_percentage: Math.max(0, savingsPercentage),
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────────────────

  private async getOrCreateDemandEscrow(demandPostId: string) {
    // Check if demand post already has an escrow account
    const posts = await this.demandPoolService.listDemandPosts({
      id: demandPostId,
    })
    if (posts.length > 0 && posts[0].escrow_account_id) {
      const accounts = await this.hawalaService.listLedgerAccounts({
        id: posts[0].escrow_account_id as string,
      })
      if (accounts.length > 0) return accounts[0]
    }

    // Create new escrow account for this demand pool
    const account = await this.hawalaService.createAccount({
      account_type: "ESCROW",
      owner_type: "SYSTEM",
      owner_id: `demand-pool-${demandPostId}`,
      metadata: { demand_post_id: demandPostId },
    })

    // Link the escrow account to the demand post
    if (posts.length > 0) {
      await this.demandPoolService.updateDemandPosts({
        id: demandPostId,
        escrow_account_id: account.id,
      })
    }

    return account
  }
}

/**
 * Factory function to create the service from the DI container.
 */
export function getCollectiveHawalaService(scope: any): CollectiveHawalaService {
  const hawalaService = scope.resolve("hawalaLedger")
  const demandPoolService = scope.resolve("demandPoolModuleService")
  return new CollectiveHawalaService(hawalaService, demandPoolService)
}
