import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"
import { createStripeAchService } from "../../../../modules/hawala-ledger/stripe-ach"

/**
 * GET /store/hawala/bank-accounts
 * List customer's linked bank accounts
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    const bankAccounts = await hawalaService.listBankAccounts({
      customer_id: customerId,
    })

    res.json({ bank_accounts: bankAccounts })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

/**
 * POST /store/hawala/bank-accounts
 * Start bank account linking process
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)

  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ error: "Authentication required" })
  }

  const { email, name, return_url, method } = req.body as {
    email: string
    name?: string
    return_url: string
    method?: "financial_connections" | "manual"
  }

  if (!email || !return_url) {
    return res.status(400).json({ error: "email and return_url are required" })
  }

  try {
    const achService = createStripeAchService()

    // Get or create Stripe customer
    const stripeCustomerId = await achService.getOrCreateCustomer({
      customerId,
      email,
      name,
    })

    // Store or update Stripe customer ID
    const existingAccounts = await hawalaService.listBankAccounts({
      customer_id: customerId,
    })

    if (method === "financial_connections" || !method) {
      // Create Financial Connections session
      const session = await achService.createBankLinkSession({
        stripeCustomerId,
        returnUrl: return_url,
      })

      res.json({
        method: "financial_connections",
        client_secret: session.clientSecret,
        session_id: session.sessionId,
        stripe_customer_id: stripeCustomerId,
      })
    } else {
      // Manual method - return Stripe customer ID for form submission
      res.json({
        method: "manual",
        stripe_customer_id: stripeCustomerId,
        message: "Submit bank details to /store/hawala/bank-accounts/manual",
      })
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
