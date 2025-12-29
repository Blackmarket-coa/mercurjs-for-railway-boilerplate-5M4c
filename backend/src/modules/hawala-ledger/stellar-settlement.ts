import {
  Keypair,
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
} from "@stellar/stellar-sdk"
import { createHash } from "crypto"

export interface StellarConfig {
  networkPassphrase: string
  horizonUrl: string
  signerSecretKey: string
  usdcIssuer: string
}

export interface SettlementData {
  batchId: string
  entries: Array<{
    id: string
    amount: number
    debit_account_id: string
    credit_account_id: string
    created_at: Date
  }>
  periodStart: Date
  periodEnd: Date
}

/**
 * Stellar Settlement Service
 * Handles blockchain anchoring and USDC settlements
 */
export class StellarSettlementService {
  private server: Horizon.Server
  private keypair: Keypair
  private networkPassphrase: string
  private usdcAsset: Asset

  constructor(config: StellarConfig) {
    this.server = new Horizon.Server(config.horizonUrl)
    this.keypair = Keypair.fromSecret(config.signerSecretKey)
    this.networkPassphrase = config.networkPassphrase
    this.usdcAsset = new Asset("USDC", config.usdcIssuer)
  }

  /**
   * Compute Merkle root for a batch of entries
   * This provides cryptographic proof of the ledger state
   */
  computeMerkleRoot(entries: Array<{ id: string; amount: number; created_at: Date }>): string {
    if (entries.length === 0) {
      return createHash("sha256").update("empty").digest("hex")
    }

    // Create leaf hashes from entries
    let hashes = entries.map(entry => {
      const data = `${entry.id}:${entry.amount}:${entry.created_at.toISOString()}`
      return createHash("sha256").update(data).digest()
    })

    // Build Merkle tree
    while (hashes.length > 1) {
      const newLevel: Buffer[] = []
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i]
        const right = hashes[i + 1] || left // Duplicate last if odd
        const combined = Buffer.concat([left as Buffer, right as Buffer])
        newLevel.push(createHash("sha256").update(combined).digest())
      }
      hashes = newLevel as any
    }

    return hashes[0].toString("hex")
  }

  /**
   * Submit settlement batch to Stellar
   * Anchors Merkle root and batch metadata on-chain
   */
  async submitSettlementBatch(data: SettlementData): Promise<{
    txHash: string
    ledgerSequence: number
    feePaid: number
    merkleRoot: string
  }> {
    // Compute Merkle root
    const merkleRoot = this.computeMerkleRoot(data.entries)

    // Get account
    const account = await this.server.loadAccount(this.keypair.publicKey())

    // Build transaction with memo containing batch info
    const memoData = JSON.stringify({
      batch: data.batchId,
      root: merkleRoot.substring(0, 16), // First 16 chars fit in memo
      count: data.entries.length,
    })

    const transaction = new TransactionBuilder(account, {
      fee: "1000", // 0.0001 XLM base fee
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `hawala_batch_${data.batchId}`,
          value: merkleRoot,
        })
      )
      .addMemo(Memo.text(memoData.substring(0, 28))) // Max 28 bytes for text memo
      .setTimeout(30)
      .build()

    // Sign and submit
    transaction.sign(this.keypair)
    const result = await this.server.submitTransaction(transaction)

    return {
      txHash: result.hash,
      ledgerSequence: result.ledger,
      feePaid: parseInt(result.fee_charged) / 10000000, // Convert stroops to XLM
      merkleRoot,
    }
  }

  /**
   * Process USDC payment on Stellar
   * For actual value transfer between Stellar accounts
   */
  async processUsdcPayment(data: {
    destinationAddress: string
    amount: string
    memo?: string
  }): Promise<{ txHash: string; ledgerSequence: number }> {
    const account = await this.server.loadAccount(this.keypair.publicKey())

    const transactionBuilder = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: this.networkPassphrase,
    }).addOperation(
      Operation.payment({
        destination: data.destinationAddress,
        asset: this.usdcAsset,
        amount: data.amount,
      })
    )

    if (data.memo) {
      transactionBuilder.addMemo(Memo.text(data.memo.substring(0, 28)))
    }

    const transaction = transactionBuilder.setTimeout(30).build()
    transaction.sign(this.keypair)

    const result = await this.server.submitTransaction(transaction)

    return {
      txHash: result.hash,
      ledgerSequence: result.ledger,
    }
  }

  /**
   * Create a new Stellar account for a user/producer
   * Returns the new keypair (secret should be encrypted and stored securely)
   */
  async createStellarAccount(): Promise<{
    publicKey: string
    secretKey: string
  }> {
    const newKeypair = Keypair.random()

    // Fund account with minimum balance (in production, use friendbot for testnet)
    const account = await this.server.loadAccount(this.keypair.publicKey())

    const transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.createAccount({
          destination: newKeypair.publicKey(),
          startingBalance: "2", // Minimum balance for trustlines
        })
      )
      .setTimeout(30)
      .build()

    transaction.sign(this.keypair)
    await this.server.submitTransaction(transaction)

    return {
      publicKey: newKeypair.publicKey(),
      secretKey: newKeypair.secret(),
    }
  }

  /**
   * Add USDC trustline to an account
   * Required before receiving USDC payments
   */
  async addUsdcTrustline(secretKey: string): Promise<{ txHash: string }> {
    const userKeypair = Keypair.fromSecret(secretKey)
    const account = await this.server.loadAccount(userKeypair.publicKey())

    const transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset: this.usdcAsset,
          limit: "1000000", // Max trust limit
        })
      )
      .setTimeout(30)
      .build()

    transaction.sign(userKeypair)
    const result = await this.server.submitTransaction(transaction)

    return { txHash: result.hash }
  }

  /**
   * Verify a settlement batch on-chain
   * Returns the stored Merkle root for verification
   */
  async verifySettlementBatch(batchId: string): Promise<{
    found: boolean
    merkleRoot?: string
  }> {
    try {
      const account = await this.server.loadAccount(this.keypair.publicKey())
      const dataKey = `hawala_batch_${batchId}`
      
      if (account.data_attr && account.data_attr[dataKey]) {
        const merkleRoot = Buffer.from(account.data_attr[dataKey], "base64").toString("utf-8")
        return { found: true, merkleRoot }
      }
      
      return { found: false }
    } catch (error) {
      return { found: false }
    }
  }

  /**
   * Get current XLM balance for gas fees
   */
  async getXlmBalance(): Promise<number> {
    const account = await this.server.loadAccount(this.keypair.publicKey())
    const xlmBalance = account.balances.find(b => b.asset_type === "native")
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0
  }

  /**
   * Get USDC balance
   */
  async getUsdcBalance(): Promise<number> {
    const account = await this.server.loadAccount(this.keypair.publicKey())
    const usdcBalance = account.balances.find(
      b => b.asset_type === "credit_alphanum4" && 
           b.asset_code === "USDC" && 
           b.asset_issuer === this.usdcAsset.getIssuer()
    )
    return usdcBalance ? parseFloat(usdcBalance.balance) : 0
  }
}

/**
 * Create configured settlement service
 */
export function createStellarSettlementService(): StellarSettlementService {
  // Use environment variables for configuration
  const config: StellarConfig = {
    networkPassphrase: process.env.STELLAR_NETWORK === "mainnet" 
      ? Networks.PUBLIC 
      : Networks.TESTNET,
    horizonUrl: process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
    signerSecretKey: process.env.STELLAR_SIGNER_SECRET || "",
    usdcIssuer: process.env.STELLAR_USDC_ISSUER || 
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", // Circle USDC on testnet
  }

  if (!config.signerSecretKey) {
    console.warn("STELLAR_SIGNER_SECRET not configured - settlement features disabled")
  }

  return new StellarSettlementService(config)
}
