import { MedusaService } from "@medusajs/framework/utils"
import {
  LedgerAccount,
  LedgerEntry,
  SettlementBatch,
  InvestmentPool,
  Investment,
  BankAccount,
  AchTransaction,
} from "./models"

class HawalaLedgerModuleService extends MedusaService({
  LedgerAccount,
  LedgerEntry,
  SettlementBatch,
  InvestmentPool,
  Investment,
  BankAccount,
  AchTransaction,
}) {
  // ==================== ACCOUNT MANAGEMENT ====================

  /**
   * Create a new ledger account with unique account number
   */
  async createAccount(data: {
    account_type: string
    currency_code?: string
    owner_type?: string
    owner_id?: string
    stellar_address?: string
    metadata?: Record<string, any>
  }) {
    const accountNumber = this.generateAccountNumber(data.account_type)
    
    return this.createLedgerAccounts({
      account_number: accountNumber,
      account_type: data.account_type,
      currency_code: data.currency_code || "USD",
      owner_type: data.owner_type,
      owner_id: data.owner_id,
      stellar_address: data.stellar_address,
      balance: 0,
      pending_balance: 0,
      available_balance: 0,
      status: "ACTIVE",
      metadata: data.metadata,
    })
  }

  /**
   * Generate unique account number
   */
  private generateAccountNumber(accountType: string): string {
    const prefix = {
      USER_WALLET: "USR",
      PRODUCER_POOL: "PRD",
      SELLER_EARNINGS: "SLR",
      PLATFORM_FEE: "PLT",
      SETTLEMENT: "STL",
      RESERVE: "RSV",
      ESCROW: "ESC",
    }[accountType] || "GEN"
    
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Get or create system accounts (platform fee, reserve, settlement)
   */
  async getOrCreateSystemAccount(accountType: string) {
    const existing = await this.listLedgerAccounts({
      filters: {
        account_type: accountType,
        owner_type: "SYSTEM",
      },
    })

    if (existing.length > 0) {
      return existing[0]
    }

    return this.createAccount({
      account_type: accountType,
      owner_type: "SYSTEM",
      owner_id: "system",
    })
  }

  // ==================== DOUBLE-ENTRY TRANSFERS ====================

  /**
   * Create a double-entry transfer between accounts
   * This is the core atomic operation - always balanced
   */
  async createTransfer(data: {
    debit_account_id: string
    credit_account_id: string
    amount: number
    entry_type: string
    description?: string
    reference_type?: string
    reference_id?: string
    order_id?: string
    investment_pool_id?: string
    idempotency_key?: string
    metadata?: Record<string, any>
  }) {
    // Check idempotency
    if (data.idempotency_key) {
      const existing = await this.listLedgerEntries({
        filters: { idempotency_key: data.idempotency_key },
      })
      if (existing.length > 0) {
        return existing[0] // Return existing entry
      }
    }

    // Get accounts
    const [debitAccount, creditAccount] = await Promise.all([
      this.retrieveLedgerAccount(data.debit_account_id),
      this.retrieveLedgerAccount(data.credit_account_id),
    ])

    if (!debitAccount || !creditAccount) {
      throw new Error("Invalid account ID")
    }

    // Check available balance for debit account
    if (Number(debitAccount.available_balance) < data.amount) {
      throw new Error(`Insufficient balance in account ${debitAccount.account_number}`)
    }

    // Create the entry
    const entry = await this.createLedgerEntries({
      debit_account_id: data.debit_account_id,
      credit_account_id: data.credit_account_id,
      amount: data.amount,
      currency_code: debitAccount.currency_code,
      entry_type: data.entry_type,
      status: "COMPLETED",
      description: data.description,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      order_id: data.order_id,
      investment_pool_id: data.investment_pool_id,
      idempotency_key: data.idempotency_key,
      metadata: data.metadata,
    })

    // Update account balances
    await this.updateBalances(data.debit_account_id, -data.amount)
    await this.updateBalances(data.credit_account_id, data.amount)

    // Update running balances on entry
    const [newDebitAccount, newCreditAccount] = await Promise.all([
      this.retrieveLedgerAccount(data.debit_account_id),
      this.retrieveLedgerAccount(data.credit_account_id),
    ])

    await this.updateLedgerEntries({
      id: entry.id,
      debit_balance_after: newDebitAccount.balance,
      credit_balance_after: newCreditAccount.balance,
    })

    return entry
  }

  /**
   * Update account balances atomically
   */
  private async updateBalances(accountId: string, delta: number) {
    const account = await this.retrieveLedgerAccount(accountId)
    const newBalance = Number(account.balance) + delta
    const newAvailable = Number(account.available_balance) + delta

    await this.updateLedgerAccounts({
      id: accountId,
      balance: newBalance,
      available_balance: newAvailable,
    })
  }

  // ==================== DEPOSIT & WITHDRAWAL ====================

  /**
   * Record a deposit (fiat in via ACH)
   */
  async recordDeposit(data: {
    credit_account_id: string
    amount: number
    stripe_payment_intent_id: string
    fee?: number
    idempotency_key?: string
    metadata?: Record<string, any>
  }) {
    // Get or create reserve account (source of deposits)
    const reserveAccount = await this.getOrCreateSystemAccount("RESERVE")

    return this.createTransfer({
      debit_account_id: reserveAccount.id,
      credit_account_id: data.credit_account_id,
      amount: data.amount,
      entry_type: "DEPOSIT",
      reference_type: "STRIPE_PAYMENT",
      reference_id: data.stripe_payment_intent_id,
      idempotency_key: data.idempotency_key,
      metadata: {
        ...data.metadata,
        fee: data.fee,
      },
    })
  }

  /**
   * Record a withdrawal (fiat out via ACH)
   */
  async recordWithdrawal(data: {
    debit_account_id: string
    amount: number
    stripe_transfer_id: string
    fee?: number
    idempotency_key?: string
    metadata?: Record<string, any>
  }) {
    const reserveAccount = await this.getOrCreateSystemAccount("RESERVE")

    return this.createTransfer({
      debit_account_id: data.debit_account_id,
      credit_account_id: reserveAccount.id,
      amount: data.amount,
      entry_type: "WITHDRAWAL",
      reference_type: "STRIPE_PAYMENT",
      reference_id: data.stripe_transfer_id,
      idempotency_key: data.idempotency_key,
      metadata: {
        ...data.metadata,
        fee: data.fee,
      },
    })
  }

  // ==================== ORDER PROCESSING ====================

  /**
   * Process an order payment through the ledger
   * Splits payment between seller, platform fee, and optional producer investment
   */
  async processOrderPayment(data: {
    customer_account_id: string
    seller_account_id: string
    order_id: string
    total_amount: number
    platform_fee_amount: number
    producer_id?: string
    auto_invest_percentage?: number
    idempotency_key: string
  }) {
    const entries: any[] = []

    // Get platform fee account
    const platformAccount = await this.getOrCreateSystemAccount("PLATFORM_FEE")

    // Calculate amounts
    const platformFee = data.platform_fee_amount
    let sellerAmount = data.total_amount - platformFee
    let investmentAmount = 0

    // Auto-invest if configured
    if (data.producer_id && data.auto_invest_percentage) {
      investmentAmount = Math.floor(sellerAmount * (data.auto_invest_percentage / 100))
      sellerAmount -= investmentAmount
    }

    // 1. Customer pays full amount to escrow first
    const escrowAccount = await this.getOrCreateSystemAccount("ESCROW")
    const purchaseEntry = await this.createTransfer({
      debit_account_id: data.customer_account_id,
      credit_account_id: escrowAccount.id,
      amount: data.total_amount,
      entry_type: "PURCHASE",
      order_id: data.order_id,
      idempotency_key: `${data.idempotency_key}-purchase`,
    })
    entries.push(purchaseEntry)

    // 2. Platform fee from escrow to platform
    const feeEntry = await this.createTransfer({
      debit_account_id: escrowAccount.id,
      credit_account_id: platformAccount.id,
      amount: platformFee,
      entry_type: "COMMISSION",
      order_id: data.order_id,
      idempotency_key: `${data.idempotency_key}-fee`,
    })
    entries.push(feeEntry)

    // 3. Seller earnings from escrow
    const sellerEntry = await this.createTransfer({
      debit_account_id: escrowAccount.id,
      credit_account_id: data.seller_account_id,
      amount: sellerAmount,
      entry_type: "TRANSFER",
      order_id: data.order_id,
      idempotency_key: `${data.idempotency_key}-seller`,
    })
    entries.push(sellerEntry)

    // 4. Optional investment to producer pool
    if (investmentAmount > 0 && data.producer_id) {
      const producerPool = await this.getOrCreateProducerPool(data.producer_id)
      if (producerPool) {
        const investEntry = await this.createTransfer({
          debit_account_id: escrowAccount.id,
          credit_account_id: producerPool.ledger_account_id,
          amount: investmentAmount,
          entry_type: "INVESTMENT",
          order_id: data.order_id,
          investment_pool_id: producerPool.id,
          idempotency_key: `${data.idempotency_key}-invest`,
        })
        entries.push(investEntry)
      }
    }

    return entries
  }

  /**
   * Get or create producer investment pool
   */
  async getOrCreateProducerPool(producerId: string) {
    const existing = await this.listInvestmentPools({
      filters: { producer_id: producerId, status: "ACTIVE" },
    })

    if (existing.length > 0) {
      return existing[0]
    }

    // Create ledger account for pool
    const poolAccount = await this.createAccount({
      account_type: "PRODUCER_POOL",
      owner_type: "PRODUCER",
      owner_id: producerId,
    })

    // Create investment pool
    return this.createInvestmentPools({
      name: `Producer Pool - ${producerId}`,
      producer_id: producerId,
      ledger_account_id: poolAccount.id,
      target_amount: 10000, // Default target
      minimum_investment: 1,
      roi_type: "REVENUE_SHARE",
      revenue_share_percentage: 5,
      status: "ACTIVE",
      auto_invest_enabled: true,
      auto_invest_percentage: 2,
    })
  }

  // ==================== INVESTMENT OPERATIONS ====================

  /**
   * Create a direct investment
   */
  async createInvestment(data: {
    pool_id: string
    investor_account_id: string
    customer_id?: string
    amount: number
    source?: string
    source_order_id?: string
    idempotency_key?: string
  }) {
    const pool = await this.retrieveInvestmentPool(data.pool_id)
    if (!pool) {
      throw new Error("Investment pool not found")
    }

    // Create ledger transfer
    const entry = await this.createTransfer({
      debit_account_id: data.investor_account_id,
      credit_account_id: pool.ledger_account_id,
      amount: data.amount,
      entry_type: "INVESTMENT",
      investment_pool_id: data.pool_id,
      idempotency_key: data.idempotency_key,
    })

    // Create investment record
    const investment = await this.createInvestments({
      pool_id: data.pool_id,
      investor_account_id: data.investor_account_id,
      customer_id: data.customer_id,
      amount: data.amount,
      currency_code: "USD",
      status: "CONFIRMED",
      source: data.source || "DIRECT",
      source_order_id: data.source_order_id,
      ledger_entry_id: entry.id,
      invested_at: new Date(),
    })

    // Update pool totals
    await this.updateInvestmentPools({
      id: data.pool_id,
      total_raised: Number(pool.total_raised) + data.amount,
      total_investors: pool.total_investors + 1,
    })

    return investment
  }

  /**
   * Distribute dividends to investors
   */
  async distributeDividends(data: {
    pool_id: string
    total_amount: number
  }) {
    const pool = await this.retrieveInvestmentPool(data.pool_id)
    if (!pool) {
      throw new Error("Investment pool not found")
    }

    const investments = await this.listInvestments({
      filters: { pool_id: data.pool_id, status: "CONFIRMED" },
    })

    const totalInvested = Number(pool.total_raised)
    const distributions: any[] = []

    for (const investment of investments) {
      // Calculate proportional share
      const share = Number(investment.amount) / totalInvested
      const dividend = Math.floor(data.total_amount * share * 100) / 100

      if (dividend > 0) {
        // Transfer dividend
        const entry = await this.createTransfer({
          debit_account_id: pool.ledger_account_id,
          credit_account_id: investment.investor_account_id,
          amount: dividend,
          entry_type: "DIVIDEND",
          investment_pool_id: data.pool_id,
          idempotency_key: `div-${pool.id}-${investment.id}-${Date.now()}`,
        })

        // Update investment record
        await this.updateInvestments({
          id: investment.id,
          actual_return: Number(investment.actual_return) + dividend,
          return_distributed: Number(investment.return_distributed) + dividend,
        })

        distributions.push({ investment_id: investment.id, amount: dividend })
      }
    }

    // Update pool totals
    await this.updateInvestmentPools({
      id: data.pool_id,
      total_distributed: Number(pool.total_distributed) + data.total_amount,
    })

    return distributions
  }

  // ==================== BALANCE QUERIES ====================

  /**
   * Get account balance with details
   */
  async getAccountBalance(accountId: string) {
    const account = await this.retrieveLedgerAccount(accountId)
    if (!account) {
      throw new Error("Account not found")
    }

    return {
      account_number: account.account_number,
      balance: Number(account.balance),
      pending_balance: Number(account.pending_balance),
      available_balance: Number(account.available_balance),
      currency_code: account.currency_code,
    }
  }

  /**
   * Get transaction history for an account
   */
  async getTransactionHistory(accountId: string, options?: {
    limit?: number
    offset?: number
    entry_type?: string
  }) {
    const [debitEntries, creditEntries] = await Promise.all([
      this.listLedgerEntries({
        filters: { debit_account_id: accountId },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      this.listLedgerEntries({
        filters: { credit_account_id: accountId },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
    ])

    // Combine and sort by created_at
    const allEntries = [...debitEntries, ...creditEntries].map(entry => ({
      ...entry,
      direction: entry.debit_account_id === accountId ? "DEBIT" : "CREDIT",
      signed_amount: entry.debit_account_id === accountId 
        ? -Number(entry.amount) 
        : Number(entry.amount),
    }))

    allEntries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return allEntries.slice(0, options?.limit || 50)
  }

  // ==================== REPORTING ====================

  /**
   * Get ledger summary for reporting
   */
  async getLedgerSummary(options?: { start_date?: Date; end_date?: Date }) {
    const accounts = await this.listLedgerAccounts({})
    
    const summary = {
      total_accounts: accounts.length,
      by_type: {} as Record<string, { count: number; total_balance: number }>,
      total_balance: 0,
    }

    for (const account of accounts) {
      const type = account.account_type
      if (!summary.by_type[type]) {
        summary.by_type[type] = { count: 0, total_balance: 0 }
      }
      summary.by_type[type].count++
      summary.by_type[type].total_balance += Number(account.balance)
      summary.total_balance += Number(account.balance)
    }

    return summary
  }
}

export default HawalaLedgerModuleService
