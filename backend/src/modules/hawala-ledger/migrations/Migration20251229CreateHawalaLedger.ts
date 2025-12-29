import { Migration } from "@mikro-orm/migrations"

export class Migration20251229CreateHawalaLedger extends Migration {
  async up(): Promise<void> {
    // Ledger Account - Core financial accounts
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_ledger_account" (
        "id" TEXT PRIMARY KEY,
        "account_number" TEXT UNIQUE NOT NULL,
        "account_type" TEXT NOT NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "balance" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "pending_balance" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "available_balance" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "owner_type" TEXT,
        "owner_id" TEXT,
        "stellar_address" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Indexes for ledger account
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_account_owner" ON "hawala_ledger_account" ("owner_type", "owner_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_account_type" ON "hawala_ledger_account" ("account_type");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_account_status" ON "hawala_ledger_account" ("status");`)

    // Ledger Entry - Double-entry transactions
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_ledger_entry" (
        "id" TEXT PRIMARY KEY,
        "debit_account_id" TEXT NOT NULL REFERENCES "hawala_ledger_account"("id"),
        "credit_account_id" TEXT NOT NULL REFERENCES "hawala_ledger_account"("id"),
        "amount" NUMERIC(20,4) NOT NULL,
        "entry_type" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "description" TEXT,
        "reference_type" TEXT,
        "reference_id" TEXT,
        "order_id" TEXT,
        "investment_pool_id" TEXT,
        "idempotency_key" TEXT UNIQUE,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Indexes for ledger entry
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_entry_debit" ON "hawala_ledger_entry" ("debit_account_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_entry_credit" ON "hawala_ledger_entry" ("credit_account_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_entry_type" ON "hawala_ledger_entry" ("entry_type");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_entry_order" ON "hawala_ledger_entry" ("order_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_ledger_entry_reference" ON "hawala_ledger_entry" ("reference_type", "reference_id");`)

    // Settlement Batch - For periodic settlements
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_settlement_batch" (
        "id" TEXT PRIMARY KEY,
        "batch_number" TEXT UNIQUE NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "settlement_type" TEXT NOT NULL,
        "total_amount" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "fee_amount" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "net_amount" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "stellar_transaction_hash" TEXT,
        "entries_count" INTEGER NOT NULL DEFAULT 0,
        "processed_at" TIMESTAMPTZ,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Investment Pool - Community investment pools
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_investment_pool" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "producer_id" TEXT NOT NULL,
        "target_amount" NUMERIC(20,4) NOT NULL,
        "current_amount" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "min_investment" NUMERIC(20,4) NOT NULL DEFAULT 10,
        "max_investment" NUMERIC(20,4),
        "expected_return_rate" NUMERIC(10,4),
        "maturity_date" TIMESTAMPTZ,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "terms_document_url" TEXT,
        "ledger_account_id" TEXT REFERENCES "hawala_ledger_account"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Investment - Individual investments
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_investment" (
        "id" TEXT PRIMARY KEY,
        "pool_id" TEXT NOT NULL REFERENCES "hawala_investment_pool"("id"),
        "investor_id" TEXT NOT NULL,
        "amount" NUMERIC(20,4) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "return_amount" NUMERIC(20,4),
        "return_paid_at" TIMESTAMPTZ,
        "entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Bank Account - For ACH integration
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_bank_account" (
        "id" TEXT PRIMARY KEY,
        "owner_type" TEXT NOT NULL,
        "owner_id" TEXT NOT NULL,
        "account_holder_name" TEXT NOT NULL,
        "account_type" TEXT NOT NULL DEFAULT 'checking',
        "routing_number" TEXT,
        "account_number_last4" TEXT,
        "stripe_bank_account_id" TEXT,
        "plaid_account_id" TEXT,
        "is_verified" BOOLEAN NOT NULL DEFAULT false,
        "is_default" BOOLEAN NOT NULL DEFAULT false,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // ACH Transaction
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_ach_transaction" (
        "id" TEXT PRIMARY KEY,
        "bank_account_id" TEXT NOT NULL REFERENCES "hawala_bank_account"("id"),
        "type" TEXT NOT NULL,
        "amount" NUMERIC(20,4) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "stripe_transfer_id" TEXT,
        "stripe_payout_id" TEXT,
        "failure_reason" TEXT,
        "processed_at" TIMESTAMPTZ,
        "ledger_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Vendor Advance
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_vendor_advance" (
        "id" TEXT PRIMARY KEY,
        "vendor_id" TEXT NOT NULL,
        "principal_amount" NUMERIC(20,4) NOT NULL,
        "fee_rate" NUMERIC(10,4) NOT NULL,
        "total_repayment" NUMERIC(20,4) NOT NULL,
        "outstanding_balance" NUMERIC(20,4) NOT NULL,
        "total_repaid" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "repayment_rate" NUMERIC(10,4) NOT NULL DEFAULT 0.2,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "disbursement_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "term_days" INTEGER NOT NULL DEFAULT 90,
        "due_date" TIMESTAMPTZ,
        "approved_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Advance Repayment
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_advance_repayment" (
        "id" TEXT PRIMARY KEY,
        "advance_id" TEXT NOT NULL REFERENCES "hawala_vendor_advance"("id"),
        "order_id" TEXT,
        "amount" NUMERIC(20,4) NOT NULL,
        "ledger_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Payout Config
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_payout_config" (
        "id" TEXT PRIMARY KEY,
        "vendor_id" TEXT NOT NULL,
        "payout_schedule" TEXT NOT NULL DEFAULT 'WEEKLY',
        "minimum_payout" NUMERIC(20,4) NOT NULL DEFAULT 25,
        "auto_payout" BOOLEAN NOT NULL DEFAULT true,
        "preferred_day" INTEGER,
        "preferred_bank_account_id" TEXT REFERENCES "hawala_bank_account"("id"),
        "reserve_percentage" NUMERIC(10,4) NOT NULL DEFAULT 0,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Payout Split Rule
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_payout_split_rule" (
        "id" TEXT PRIMARY KEY,
        "vendor_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "destination_type" TEXT NOT NULL,
        "destination_id" TEXT NOT NULL,
        "percentage" NUMERIC(10,4) NOT NULL,
        "fixed_amount" NUMERIC(20,4),
        "priority" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Payout Request
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_payout_request" (
        "id" TEXT PRIMARY KEY,
        "vendor_id" TEXT NOT NULL,
        "amount" NUMERIC(20,4) NOT NULL,
        "fee_amount" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "net_amount" NUMERIC(20,4) NOT NULL,
        "payout_tier" TEXT NOT NULL DEFAULT 'STANDARD',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "bank_account_id" TEXT REFERENCES "hawala_bank_account"("id"),
        "ledger_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "processed_at" TIMESTAMPTZ,
        "failure_reason" TEXT,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Chargeback Protection
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_chargeback_protection" (
        "id" TEXT PRIMARY KEY,
        "vendor_id" TEXT NOT NULL,
        "coverage_amount" NUMERIC(20,4) NOT NULL,
        "deductible" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "premium_rate" NUMERIC(10,4) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "coverage_start" TIMESTAMPTZ NOT NULL,
        "coverage_end" TIMESTAMPTZ NOT NULL,
        "claims_count" INTEGER NOT NULL DEFAULT 0,
        "claims_total" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Chargeback Claim
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_chargeback_claim" (
        "id" TEXT PRIMARY KEY,
        "protection_id" TEXT NOT NULL REFERENCES "hawala_chargeback_protection"("id"),
        "order_id" TEXT NOT NULL,
        "amount" NUMERIC(20,4) NOT NULL,
        "reason" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "evidence_urls" JSONB,
        "covered_amount" NUMERIC(20,4),
        "resolved_at" TIMESTAMPTZ,
        "ledger_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Vendor Payment (V2V)
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_vendor_payment" (
        "id" TEXT PRIMARY KEY,
        "payer_vendor_id" TEXT NOT NULL,
        "payee_vendor_id" TEXT NOT NULL,
        "amount" NUMERIC(20,4) NOT NULL,
        "fee_amount" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "payment_type" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "invoice_number" TEXT,
        "reference_note" TEXT,
        "ledger_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Vendor Credit Line
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_vendor_credit_line" (
        "id" TEXT PRIMARY KEY,
        "vendor_id" TEXT NOT NULL,
        "credit_limit" NUMERIC(20,4) NOT NULL,
        "available_credit" NUMERIC(20,4) NOT NULL,
        "current_balance" NUMERIC(20,4) NOT NULL DEFAULT 0,
        "interest_rate" NUMERIC(10,4) NOT NULL,
        "minimum_payment_rate" NUMERIC(10,4) NOT NULL DEFAULT 0.1,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "approved_at" TIMESTAMPTZ,
        "billing_cycle_day" INTEGER NOT NULL DEFAULT 1,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)

    // Credit Line Transaction
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hawala_credit_line_transaction" (
        "id" TEXT PRIMARY KEY,
        "credit_line_id" TEXT NOT NULL REFERENCES "hawala_vendor_credit_line"("id"),
        "type" TEXT NOT NULL,
        "amount" NUMERIC(20,4) NOT NULL,
        "description" TEXT,
        "reference_type" TEXT,
        "reference_id" TEXT,
        "ledger_entry_id" TEXT REFERENCES "hawala_ledger_entry"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "hawala_credit_line_transaction" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_vendor_credit_line" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_vendor_payment" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_chargeback_claim" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_chargeback_protection" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_payout_request" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_payout_split_rule" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_payout_config" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_advance_repayment" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_vendor_advance" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_ach_transaction" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_bank_account" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_investment" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_investment_pool" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_settlement_batch" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_ledger_entry" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "hawala_ledger_account" CASCADE;`)
  }
}
