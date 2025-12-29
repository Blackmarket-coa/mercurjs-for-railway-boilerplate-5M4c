# Hawala Ledger Module - Environment Variables

The Hawala Ledger module provides a double-entry bookkeeping system with Stellar blockchain settlement and Stripe ACH integration for the marketplace.

## Required Environment Variables

Add these to your `.env` file in the `backend` directory:

```bash
# ============================================
# STRIPE ACH CONFIGURATION
# ============================================

# Your Stripe secret key (required for ACH deposits/withdrawals)
STRIPE_SECRET_KEY=sk_live_...

# Stripe webhook signing secret for ACH events
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# STELLAR BLOCKCHAIN CONFIGURATION
# ============================================

# Network: "testnet" or "mainnet"
STELLAR_NETWORK=testnet

# Horizon API URL (Stellar's REST API)
# Testnet: https://horizon-testnet.stellar.org
# Mainnet: https://horizon.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Your Stellar signing account secret key
# Generate at: https://laboratory.stellar.org/#account-creator
STELLAR_SIGNER_SECRET=S...

# USDC issuer address on Stellar
# Testnet: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
# Mainnet: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN (Circle)
STELLAR_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

## Feature Configuration

### ACH Fee Structure
The default ACH fee is 0.8% capped at $5. To modify:

```typescript
// In stripe-ach.ts
const config: AchConfig = {
  platformFeePercentage: 0.008, // 0.8%
  platformFeeMax: 5, // $5 cap
}
```

### Platform Fee on Orders
The default platform fee on orders is 5%. Configure in the subscriber:

```typescript
// In hawala-order-payment.ts
const platformFeePercentage = 0.05 // 5%
```

### Settlement Schedule
Daily settlement batches are created at midnight UTC. Modify the cron schedule:

```typescript
// In hawala-settlement.ts
export const config = {
  name: "hawala-daily-settlement",
  schedule: "0 0 * * *", // Daily at midnight UTC
}
```

## Stripe Webhook Setup

Configure these webhook events in your Stripe Dashboard:

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/webhooks/hawala/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payout.paid`
   - `payout.failed`
   - `financial_connections.account.disconnected`

## Stellar Account Setup

### For Testnet (Development)

1. Go to https://laboratory.stellar.org/#account-creator
2. Select "Test Network"
3. Click "Generate keypair"
4. Click "Create account" to fund with testnet XLM
5. Save the Secret Key as `STELLAR_SIGNER_SECRET`

### For Mainnet (Production)

1. Create a new Stellar keypair securely
2. Fund with at least 5 XLM for reserves
3. Add USDC trustline via:
   ```typescript
   const stellarService = createStellarSettlementService()
   await stellarService.addUsdcTrustline(secretKey)
   ```

## API Endpoints

### Store (Customer) Endpoints
- `GET /store/hawala/wallet` - Get wallet and balance
- `POST /store/hawala/wallet` - Create wallet
- `GET /store/hawala/transactions` - Transaction history
- `GET /store/hawala/investments` - List investments
- `POST /store/hawala/investments` - Create investment
- `GET /store/hawala/pools` - List investment pools
- `GET /store/hawala/bank-accounts` - List linked banks
- `POST /store/hawala/bank-accounts` - Start bank linking
- `POST /store/hawala/bank-accounts/link` - Complete bank linking
- `POST /store/hawala/deposit` - ACH deposit
- `POST /store/hawala/withdraw` - ACH withdrawal

### Admin Endpoints
- `GET/POST /admin/hawala/accounts` - Manage accounts
- `GET/PATCH /admin/hawala/accounts/:id` - Account details
- `GET /admin/hawala/accounts/:id/transactions` - Account transactions
- `GET/POST /admin/hawala/transfers` - Manage transfers
- `GET/POST /admin/hawala/pools` - Manage investment pools
- `GET/PATCH /admin/hawala/pools/:id` - Pool details
- `POST /admin/hawala/pools/:id/dividends` - Distribute dividends
- `GET/POST /admin/hawala/settlements` - Settlement batches
- `GET/POST /admin/hawala/settlements/:id` - Settlement details/verify
- `GET /admin/hawala/summary` - Ledger summary

### Vendor Endpoints
- `GET /vendor/hawala/earnings` - Vendor earnings account
- `GET/POST /vendor/hawala/pools` - Vendor investment pools
- `GET/PATCH /vendor/hawala/pools/:id` - Pool management
- `POST /vendor/hawala/pools/:id/withdraw` - Withdraw from pool

## Database Models

The module creates these database tables:
- `ledger_account` - Double-entry accounts
- `ledger_entry` - Transaction entries
- `settlement_batch` - Blockchain settlement batches
- `investment_pool` - Producer investment pools
- `investment` - Individual investments
- `bank_account` - Linked bank accounts
- `ach_transaction` - ACH transaction records

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Idempotency keys** - All transfers use idempotency to prevent duplicates
3. **Stellar anchoring** - Settlement batches are anchored with Merkle roots
4. **ACH verification** - Bank accounts require Stripe verification
5. **Balance checks** - All debits verify available balance first

## Troubleshooting

### "STELLAR_SIGNER_SECRET not configured"
Set the environment variable or disable settlement features for development.

### "Insufficient balance"
Ensure the source account has sufficient available_balance (not just balance).

### "Bank account is not verified"
Complete Stripe Financial Connections flow or micro-deposit verification.

### Settlement batch failed
Check Stellar network status and ensure account has XLM for fees (~0.00001 XLM per transaction).
