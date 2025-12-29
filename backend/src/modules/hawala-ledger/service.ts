import { MedusaService } from "@medusajs/framework/utils"
import {
  LedgerAccount,
  LedgerEntry,
  SettlementBatch,
  InvestmentPool,
  Investment,
  BankAccount,
  AchTransaction,
  VendorAdvance,
  AdvanceRepayment,
  PayoutConfig,
  PayoutSplitRule,
  PayoutRequest,
  ChargebackProtection,
  ChargebackClaim,
  VendorPayment,
  VendorCreditLine,
  CreditLineTransaction,
} from "./models"

class HawalaLedgerModuleService extends MedusaService({
  LedgerAccount,
  LedgerEntry,
  SettlementBatch,
  InvestmentPool,
  Investment,
  BankAccount,
  AchTransaction,
  VendorAdvance,
  AdvanceRepayment,
  PayoutConfig,
  PayoutSplitRule,
  PayoutRequest,
  ChargebackProtection,
  ChargebackClaim,
  VendorPayment,
  VendorCreditLine,
  CreditLineTransaction,
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
      account_type: data.account_type as any,
      currency_code: data.currency_code || "USD",
      owner_type: data.owner_type as any,
      owner_id: data.owner_id,
      stellar_address: data.stellar_address,
      balance: 0,
      pending_balance: 0,
      available_balance: 0,
      status: "ACTIVE" as const,
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
      account_type: accountType,
      owner_type: "SYSTEM",
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
      entry_type: data.entry_type as any,
      status: "COMPLETED" as const,
      description: data.description,
      reference_type: data.reference_type as any,
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
      roi_type: "REVENUE_SHARE" as const,
      revenue_share_percentage: 5,
      status: "ACTIVE" as const,
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
      status: "CONFIRMED" as const,
      source: (data.source || "DIRECT") as "DIRECT" | "AUTO_ORDER" | "GIFT",
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
        debit_account_id: accountId,
      }),
      this.listLedgerEntries({
        credit_account_id: accountId,
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

  // ==================== INSTANT PAYOUTS ====================

  /**
   * Payout tier configuration with fees
   */
  private readonly PAYOUT_TIERS = {
    INSTANT: { fee_rate: 0.01, name: "Instant", speed: "30 minutes", method: "DEBIT_CARD_PUSH" },
    SAME_DAY: { fee_rate: 0.005, name: "Same-Day", speed: "End of day", method: "RTP" },
    NEXT_DAY: { fee_rate: 0.0025, name: "Next-Day", speed: "Next business day", method: "ACH" },
    WEEKLY: { fee_rate: 0, name: "Weekly", speed: "Every Friday", method: "ACH_BATCH" },
  }

  /**
   * Get available payout options for a vendor
   */
  async getPayoutOptions(vendorId: string) {
    // Get vendor's ledger account
    const accounts = await this.listLedgerAccounts({
      filters: {
        owner_type: "SELLER",
        owner_id: vendorId,
        account_type: "SELLER_EARNINGS",
      },
    })

    if (accounts.length === 0) {
      throw new Error("Vendor account not found")
    }

    const account = accounts[0]
    const availableBalance = Number(account.available_balance)

    // Get payout config
    const configs = await this.listPayoutConfigs({
      filters: { vendor_id: vendorId },
    })
    const config = configs[0]

    // Build payout options
    const options = Object.entries(this.PAYOUT_TIERS).map(([tier, info]) => {
      const fee = availableBalance * info.fee_rate
      const netAmount = availableBalance - fee

      return {
        tier,
        name: info.name,
        speed: info.speed,
        method: info.method,
        fee_rate: info.fee_rate,
        fee_rate_display: `${(info.fee_rate * 100).toFixed(2)}%`,
        fee_amount: fee,
        net_amount: netAmount,
        available: tier === "INSTANT" 
          ? (config?.instant_payout_eligible ?? false)
          : true,
      }
    })

    return {
      available_balance: availableBalance,
      currency: account.currency_code,
      options,
      default_tier: config?.default_payout_tier || "WEEKLY",
      instant_payout_eligible: config?.instant_payout_eligible ?? false,
      instant_payout_daily_limit: config?.instant_payout_daily_limit ?? 10000,
      instant_payout_remaining: config 
        ? Number(config.instant_payout_daily_limit) - Number(config.instant_payout_used_today)
        : 0,
    }
  }

  /**
   * Request a payout
   */
  async requestPayout(data: {
    vendor_id: string
    amount: number
    payout_tier: "INSTANT" | "SAME_DAY" | "NEXT_DAY" | "WEEKLY"
    bank_account_id?: string
  }) {
    const tierConfig = this.PAYOUT_TIERS[data.payout_tier]
    if (!tierConfig) {
      throw new Error("Invalid payout tier")
    }

    // Get vendor account
    const accounts = await this.listLedgerAccounts({
      filters: {
        owner_type: "SELLER",
        owner_id: data.vendor_id,
        account_type: "SELLER_EARNINGS",
      },
    })

    if (accounts.length === 0) {
      throw new Error("Vendor account not found")
    }

    const account = accounts[0]

    // Validate balance
    if (Number(account.available_balance) < data.amount) {
      throw new Error("Insufficient balance")
    }

    // Calculate fees
    const feeAmount = data.amount * tierConfig.fee_rate
    const netAmount = data.amount - feeAmount

    // Get platform fee account
    const platformAccount = await this.getOrCreateSystemAccount("PLATFORM_FEE")

    // Create payout request
    const payoutRequest = await this.createPayoutRequests({
      vendor_id: data.vendor_id,
      ledger_account_id: account.id,
      bank_account_id: data.bank_account_id,
      payout_tier: data.payout_tier as "INSTANT" | "SAME_DAY" | "NEXT_DAY" | "WEEKLY",
      payout_method: tierConfig.method as any,
      gross_amount: data.amount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      fee_rate: tierConfig.fee_rate,
      requested_at: new Date(),
      status: "PENDING" as const,
    })

    // Create ledger entries
    // 1. Debit vendor account for full amount
    // 2. Credit platform for fee (if any)
    // 3. Credit settlement account for net amount

    const settlementAccount = await this.getOrCreateSystemAccount("SETTLEMENT")

    // Main transfer (vendor → settlement)
    await this.createTransfer({
      debit_account_id: account.id,
      credit_account_id: settlementAccount.id,
      amount: netAmount,
      entry_type: "WITHDRAWAL",
      description: `${tierConfig.name} payout`,
      reference_type: "PAYOUT_REQUEST",
      reference_id: payoutRequest.id,
    })

    // Fee transfer (if applicable)
    if (feeAmount > 0) {
      await this.createTransfer({
        debit_account_id: account.id,
        credit_account_id: platformAccount.id,
        amount: feeAmount,
        entry_type: "FEE",
        description: `${tierConfig.name} payout fee`,
        reference_type: "PAYOUT_REQUEST",
        reference_id: payoutRequest.id,
      })
    }

    // Update status to processing
    await this.updatePayoutRequests({
      id: payoutRequest.id,
      status: "PROCESSING" as const,
    })

    return payoutRequest
  }

  // ==================== VENDOR ADVANCES ====================

  /**
   * Calculate advance eligibility for a vendor
   */
  async calculateAdvanceEligibility(vendorId: string) {
    // Get vendor's ledger account
    const accounts = await this.listLedgerAccounts({
      filters: {
        owner_type: "SELLER",
        owner_id: vendorId,
        account_type: "SELLER_EARNINGS",
      },
    })

    if (accounts.length === 0) {
      return {
        eligible: false,
        reason: "No vendor account found",
        max_advance: 0,
        suggested_term_days: 0,
        daily_repayment_capacity: 0,
      }
    }

    const account = accounts[0]

    // Get last 30 days of credit entries (revenue)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const entries = await this.listLedgerEntries({
      filters: {
        credit_account_id: account.id,
        entry_type: "SALE",
      },
    })

    // Calculate metrics
    const recentEntries = entries.filter(e => 
      new Date(e.created_at) >= thirtyDaysAgo
    )
    const last30DaysRevenue = recentEntries.reduce(
      (sum, e) => sum + Number(e.amount), 
      0
    )
    const avgDailyRevenue = last30DaysRevenue / 30

    // Check for existing active advances
    const activeAdvances = await this.listVendorAdvances({
      filters: {
        vendor_id: vendorId,
        status: "ACTIVE",
      },
    })

    if (activeAdvances.length > 0) {
      return {
        eligible: false,
        reason: "Active advance exists",
        max_advance: 0,
        suggested_term_days: 0,
        daily_repayment_capacity: 0,
        active_advance: activeAdvances[0],
      }
    }

    // Eligibility criteria
    const minRevenue = 500 // Minimum $500 in last 30 days
    const minDays = entries.length >= 10 // At least 10 sales

    if (last30DaysRevenue < minRevenue || !minDays) {
      return {
        eligible: false,
        reason: "Insufficient sales history",
        max_advance: 0,
        suggested_term_days: 0,
        daily_repayment_capacity: 0,
        metrics: {
          last_30_days_revenue: last30DaysRevenue,
          transaction_count: entries.length,
          avg_daily_revenue: avgDailyRevenue,
        },
      }
    }

    // Calculate advance capacity
    const repaymentCapacity = avgDailyRevenue * 0.20 // 20% of daily sales
    const maxAdvance = repaymentCapacity * 30 // ~30 days of repayment

    return {
      eligible: true,
      max_advance: Math.round(maxAdvance * 100) / 100,
      suggested_term_days: 30,
      daily_repayment_capacity: Math.round(repaymentCapacity * 100) / 100,
      fee_options: [
        { type: "FACTOR_RATE", rate: 1.08, total_repayment: maxAdvance * 1.08, apr_equivalent: "~10%" },
        { type: "FACTOR_RATE", rate: 1.12, total_repayment: maxAdvance * 1.12, apr_equivalent: "~15%" },
      ],
      metrics: {
        last_30_days_revenue: last30DaysRevenue,
        transaction_count: entries.length,
        avg_daily_revenue: avgDailyRevenue,
      },
    }
  }

  /**
   * Request a vendor advance
   */
  async requestAdvance(data: {
    vendor_id: string
    amount: number
    fee_rate: number
    term_days: number
    repayment_rate?: number
  }) {
    // Validate eligibility
    const eligibility = await this.calculateAdvanceEligibility(data.vendor_id)
    
    if (!eligibility.eligible) {
      throw new Error(`Not eligible for advance: ${eligibility.reason}`)
    }

    if (data.amount > eligibility.max_advance) {
      throw new Error(`Amount exceeds maximum eligible advance of $${eligibility.max_advance}`)
    }

    // Get vendor account
    const accounts = await this.listLedgerAccounts({
      filters: {
        owner_type: "SELLER",
        owner_id: data.vendor_id,
        account_type: "SELLER_EARNINGS",
      },
    })
    const account = accounts[0]

    // Get or create reserve account for advances
    const reserveAccount = await this.getOrCreateSystemAccount("RESERVE")

    // Calculate dates
    const startDate = new Date()
    const expectedEndDate = new Date()
    expectedEndDate.setDate(expectedEndDate.getDate() + data.term_days)

    // Total owed
    const totalOwed = data.amount * data.fee_rate

    // Create the advance record
    const advance = await this.createVendorAdvances({
      vendor_id: data.vendor_id,
      ledger_account_id: account.id,
      principal_amount: data.amount,
      outstanding_balance: totalOwed,
      fee_type: "FACTOR_RATE" as const,
      fee_rate: data.fee_rate,
      repayment_method: "AUTO_DEDUCT" as const,
      repayment_rate: data.repayment_rate || 0.20,
      term_days: data.term_days,
      start_date: startDate,
      expected_end_date: expectedEndDate,
      eligibility_snapshot: eligibility.metrics,
      status: "PENDING_APPROVAL" as const,
    })

    // For now, auto-approve (in production, might want manual review)
    await this.updateVendorAdvances({
      id: advance.id,
      status: "ACTIVE" as const,
      approved_at: new Date(),
    })

    // Create ledger entry: Reserve → Vendor
    await this.createTransfer({
      debit_account_id: reserveAccount.id,
      credit_account_id: account.id,
      amount: data.amount,
      entry_type: "ADVANCE",
      description: `Vendor advance - ${data.term_days} day term`,
      reference_type: "VENDOR_ADVANCE",
      reference_id: advance.id,
    })

    return advance
  }

  /**
   * Auto-deduct advance repayment from a sale
   */
  async processAdvanceRepayment(data: {
    vendor_id: string
    order_id: string
    sale_amount: number
  }) {
    // Get active advance
    const advances = await this.listVendorAdvances({
      filters: {
        vendor_id: data.vendor_id,
        status: "ACTIVE",
      },
    })

    if (advances.length === 0) {
      return null // No active advance
    }

    const advance = advances[0]
    const repaymentRate = Number(advance.repayment_rate)
    const outstandingBalance = Number(advance.outstanding_balance)

    // Calculate repayment (percentage of sale, capped at outstanding)
    let repaymentAmount = data.sale_amount * repaymentRate
    repaymentAmount = Math.min(repaymentAmount, outstandingBalance)

    if (repaymentAmount <= 0) {
      return null
    }

    // Get accounts
    const vendorAccounts = await this.listLedgerAccounts({
      filters: {
        owner_type: "SELLER",
        owner_id: data.vendor_id,
        account_type: "SELLER_EARNINGS",
      },
    })
    const vendorAccount = vendorAccounts[0]
    const reserveAccount = await this.getOrCreateSystemAccount("RESERVE")

    // Create ledger entry: Vendor → Reserve
    const entry = await this.createTransfer({
      debit_account_id: vendorAccount.id,
      credit_account_id: reserveAccount.id,
      amount: repaymentAmount,
      entry_type: "ADVANCE_REPAYMENT",
      description: `Advance repayment from order ${data.order_id}`,
      reference_type: "VENDOR_ADVANCE",
      reference_id: advance.id,
      order_id: data.order_id,
    })

    // Update advance balance
    const newBalance = outstandingBalance - repaymentAmount
    const newTotalRepaid = Number(advance.total_repaid) + repaymentAmount

    await this.updateVendorAdvances({
      id: advance.id,
      outstanding_balance: newBalance,
      total_repaid: newTotalRepaid,
      status: newBalance <= 0 ? ("REPAID" as const) : ("ACTIVE" as const),
      actual_end_date: newBalance <= 0 ? new Date() : undefined,
    })

    // Record the repayment
    await this.createAdvanceRepayments({
      advance_id: advance.id,
      ledger_entry_id: entry.id,
      order_id: data.order_id,
      principal_amount: repaymentAmount, // Simplified - in reality split principal/fee
      total_amount: repaymentAmount,
      outstanding_balance_after: newBalance,
      repayment_type: "AUTO_DEDUCT" as const,
      status: "COMPLETED" as const,
    })

    return {
      repayment_amount: repaymentAmount,
      outstanding_balance: newBalance,
      advance_repaid: newBalance <= 0,
    }
  }

  // ==================== VENDOR-TO-VENDOR PAYMENTS ====================

  /**
   * Create a vendor-to-vendor payment (internal transfer)
   */
  async createVendorToVendorPayment(data: {
    payer_vendor_id: string
    payee_vendor_id: string
    amount: number
    payment_type: string
    invoice_number?: string
    purchase_order_number?: string
    reference_note?: string
  }) {
    // Get both vendor accounts
    const [payerAccounts, payeeAccounts] = await Promise.all([
      this.listLedgerAccounts({
        filters: {
          owner_type: "SELLER",
          owner_id: data.payer_vendor_id,
          account_type: "SELLER_EARNINGS",
        },
      }),
      this.listLedgerAccounts({
        filters: {
          owner_type: "SELLER",
          owner_id: data.payee_vendor_id,
          account_type: "SELLER_EARNINGS",
        },
      }),
    ])

    if (payerAccounts.length === 0 || payeeAccounts.length === 0) {
      throw new Error("One or both vendor accounts not found")
    }

    const payerAccount = payerAccounts[0]
    const payeeAccount = payeeAccounts[0]

    // Validate balance
    if (Number(payerAccount.available_balance) < data.amount) {
      throw new Error("Insufficient balance")
    }

    // Create ledger transfer
    const entry = await this.createTransfer({
      debit_account_id: payerAccount.id,
      credit_account_id: payeeAccount.id,
      amount: data.amount,
      entry_type: "VENDOR_PAYMENT",
      description: data.reference_note || `Vendor payment: ${data.payment_type}`,
      reference_type: "VENDOR_PAYMENT",
    })

    // Create vendor payment record
    const payment = await this.createVendorPayments({
      payer_vendor_id: data.payer_vendor_id,
      payer_ledger_account_id: payerAccount.id,
      payee_vendor_id: data.payee_vendor_id,
      payee_ledger_account_id: payeeAccount.id,
      amount: data.amount,
      payment_type: data.payment_type as any,
      invoice_number: data.invoice_number,
      purchase_order_number: data.purchase_order_number,
      reference_note: data.reference_note,
      ledger_entry_id: entry.id,
      status: "COMPLETED" as const,
    })

    return payment
  }

  // ==================== VENDOR DASHBOARD ====================

  /**
   * Get comprehensive vendor financial dashboard data
   */
  async getVendorDashboard(vendorId: string) {
    // Get vendor account using direct filters (not wrapped in filters object)
    const accounts = await this.listLedgerAccounts({
      owner_type: "SELLER",
      owner_id: vendorId,
      account_type: "SELLER_EARNINGS",
    })

    if (accounts.length === 0) {
      throw new Error("Vendor account not found")
    }

    const account = accounts[0]

    // Get date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(todayStart)
    monthStart.setDate(monthStart.getDate() - 30)

    // Get all entries for this account
    const entries = await this.getTransactionHistory(account.id, { limit: 1000 })

    // Calculate metrics
    const todayEntries = entries.filter(e => new Date(e.created_at) >= todayStart)
    const weekEntries = entries.filter(e => new Date(e.created_at) >= weekStart)
    const monthEntries = entries.filter(e => new Date(e.created_at) >= monthStart)

    const calcRevenue = (items: typeof entries) => 
      items.filter(e => e.direction === "CREDIT" && e.entry_type === "PURCHASE")
           .reduce((sum, e) => sum + Number(e.amount), 0)

    const todayRevenue = calcRevenue(todayEntries)
    const weekRevenue = calcRevenue(weekEntries)
    const monthRevenue = calcRevenue(monthEntries)

    // Get pending orders (entries in PENDING status)
    const pendingEntries = await this.listLedgerEntries({
      credit_account_id: account.id,
      status: "PENDING",
    })
    const pendingAmount = pendingEntries.reduce((sum, e) => sum + Number(e.amount), 0)

    // Get active advance
    const activeAdvances = await this.listVendorAdvances({
      vendor_id: vendorId,
      status: "ACTIVE",
    })

    // Get payout config
    const payoutConfigs = await this.listPayoutConfigs({
      vendor_id: vendorId,
    })

    // Get investment pools
    const pools = await this.listInvestmentPools({
      producer_id: vendorId,
    })

    // Calculate daily average for projection
    const avgDailyRevenue = monthRevenue / 30

    return {
      // Balances
      available_balance: Number(account.available_balance),
      pending_balance: pendingAmount,
      total_balance: Number(account.balance),
      currency: account.currency_code,

      // Revenue metrics
      today: {
        revenue: todayRevenue,
        transaction_count: todayEntries.filter(e => e.direction === "CREDIT").length,
      },
      week: {
        revenue: weekRevenue,
        transaction_count: weekEntries.filter(e => e.direction === "CREDIT").length,
      },
      month: {
        revenue: monthRevenue,
        transaction_count: monthEntries.filter(e => e.direction === "CREDIT").length,
      },

      // Projections
      projections: {
        avg_daily_revenue: avgDailyRevenue,
        projected_week: avgDailyRevenue * 7,
        projected_month: avgDailyRevenue * 30,
      },

      // Recent activity
      recent_transactions: entries.slice(0, 10).map(e => ({
        id: e.id,
        amount: Number(e.amount),
        direction: e.direction,
        entry_type: e.entry_type,
        description: e.description,
        created_at: e.created_at,
      })),

      // Advance status - simplified
      advance: activeAdvances.length > 0 ? {
        has_active: true,
        principal: Number(activeAdvances[0].principal_amount || 0),
        outstanding: Number(activeAdvances[0].outstanding_balance || 0),
        repaid: Number(activeAdvances[0].total_repaid || 0),
      } : {
        has_active: false,
      },

      // Payout settings - simplified
      payout: payoutConfigs.length > 0 ? {
        default_tier: payoutConfigs[0].default_payout_tier || "WEEKLY",
        auto_enabled: payoutConfigs[0].auto_payout_enabled || false,
      } : null,

      // Investment pools - simplified
      investment_pools: pools.map(p => ({
        id: p.id,
        name: p.name,
        target: Number(p.target_amount || 0),
        raised: Number(p.total_raised || 0),
        status: p.status,
      })),
    }
  }

  // ==================== SPLIT PAYOUTS ====================

  /**
   * Get or create payout config for a vendor
   */
  async getOrCreatePayoutConfig(vendorId: string, ledgerAccountId: string) {
    const existing = await this.listPayoutConfigs({
      filters: { vendor_id: vendorId },
    })

    if (existing.length > 0) {
      return existing[0]
    }

    return this.createPayoutConfigs({
      vendor_id: vendorId,
      ledger_account_id: ledgerAccountId,
      default_payout_tier: "WEEKLY" as const,
      auto_payout_enabled: true,
      auto_payout_threshold: 50,
      instant_payout_eligible: false,
      split_payout_enabled: false,
      status: "ACTIVE" as const,
    })
  }

  /**
   * Update payout configuration
   */
  async updatePayoutConfiguration(vendorId: string, updates: {
    default_payout_tier?: "INSTANT" | "SAME_DAY" | "NEXT_DAY" | "WEEKLY"
    auto_payout_enabled?: boolean
    auto_payout_threshold?: number
    split_payout_enabled?: boolean
  }) {
    const configs = await this.listPayoutConfigs({
      filters: { vendor_id: vendorId },
    })

    if (configs.length === 0) {
      throw new Error("Payout config not found")
    }

    return this.updatePayoutConfigs({
      id: configs[0].id,
      ...updates,
    })
  }

  /**
   * Add or update a split rule
   */
  async upsertSplitRule(data: {
    vendor_id: string
    payout_config_id: string
    destination_type: string
    percentage: number
    destination_ledger_account_id?: string
    destination_bank_account_id?: string
    label?: string
  }) {
    // Check if rule exists for this destination type
    const existing = await this.listPayoutSplitRules({
      filters: {
        payout_config_id: data.payout_config_id,
        destination_type: data.destination_type,
      },
    })

    if (existing.length > 0) {
      return this.updatePayoutSplitRules({
        id: existing[0].id,
        percentage: data.percentage,
        destination_ledger_account_id: data.destination_ledger_account_id,
        destination_bank_account_id: data.destination_bank_account_id,
        label: data.label,
      })
    }

    return this.createPayoutSplitRules({
      payout_config_id: data.payout_config_id,
      vendor_id: data.vendor_id,
      destination_type: data.destination_type as any,
      percentage: data.percentage,
      destination_ledger_account_id: data.destination_ledger_account_id,
      destination_bank_account_id: data.destination_bank_account_id,
      label: data.label,
      is_active: true,
    })
  }

  /**
   * Process split payouts for incoming revenue
   */
  async processSplitPayout(vendorId: string, grossAmount: number, orderId?: string) {
    const configs = await this.listPayoutConfigs({
      filters: { vendor_id: vendorId, split_payout_enabled: true },
    })

    if (configs.length === 0) {
      return null // No split config, all goes to main account
    }

    const config = configs[0]

    // Get split rules
    const rules = await this.listPayoutSplitRules({
      filters: {
        payout_config_id: config.id,
        is_active: true,
      },
    })

    if (rules.length === 0) {
      return null
    }

    // Validate rules sum to 100%
    const totalPercentage = rules.reduce((sum, r) => sum + Number(r.percentage), 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      console.warn(`Split rules for vendor ${vendorId} do not sum to 100%: ${totalPercentage}`)
    }

    const splits: Array<{ destination: string; amount: number; ledger_entry_id?: string }> = []

    // Process each rule
    for (const rule of rules) {
      const amount = grossAmount * (Number(rule.percentage) / 100)
      
      if (amount > 0 && rule.destination_ledger_account_id) {
        // Create internal transfer to sub-account
        const entry = await this.createTransfer({
          debit_account_id: config.ledger_account_id,
          credit_account_id: rule.destination_ledger_account_id,
          amount,
          entry_type: "SPLIT_PAYOUT",
          description: rule.label || `Split to ${rule.destination_type}`,
          reference_type: "ORDER",
          reference_id: orderId,
        })

        splits.push({
          destination: rule.destination_type,
          amount,
          ledger_entry_id: entry.id,
        })
      }
    }

    return { splits, total_split: grossAmount }
  }
}

export default HawalaLedgerModuleService
