import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /vendor/hawala/advances
 * Get advance eligibility and status for the authenticated vendor
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const hawalaService: HawalaLedgerModuleService = req.scope.resolve("hawalaLedgerModuleService")
    
    // Get vendor ID from auth context
    const vendorId = (req as any).auth_context?.actor_id
    if (!vendorId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Get eligibility
    const eligibility = await hawalaService.calculateAdvanceEligibility(vendorId)

    // Get any existing advances
    const advances = await hawalaService.listVendorAdvances({
      filters: { vendor_id: vendorId },
    })

    res.json({
      eligibility,
      advances: advances.map(a => ({
        id: a.id,
        principal: Number(a.principal_amount),
        outstanding: Number(a.outstanding_balance),
        repaid: Number(a.total_repaid),
        fee_rate: Number(a.fee_rate),
        repayment_rate: Number(a.repayment_rate),
        term_days: a.term_days,
        start_date: a.start_date,
        expected_end_date: a.expected_end_date,
        actual_end_date: a.actual_end_date,
        status: a.status,
      })),
    })
  } catch (error: any) {
    console.error("Error getting advance info:", error)
    res.status(400).json({ error: error.message })
  }
}

/**
 * POST /vendor/hawala/advances
 * Request a new advance
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const hawalaService: HawalaLedgerModuleService = req.scope.resolve("hawalaLedgerModuleService")
    
    // Get vendor ID from auth context
    const vendorId = (req as any).auth_context?.actor_id
    if (!vendorId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { amount, fee_rate, term_days, repayment_rate } = req.body as {
      amount: number
      fee_rate: number       // e.g., 1.08 for 8% fee
      term_days: number      // e.g., 30
      repayment_rate?: number // e.g., 0.20 for 20% of sales
    }

    if (!amount || !fee_rate || !term_days) {
      return res.status(400).json({ 
        error: "amount, fee_rate, and term_days are required" 
      })
    }

    const advance = await hawalaService.requestAdvance({
      vendor_id: vendorId,
      amount,
      fee_rate,
      term_days,
      repayment_rate,
    })

    res.status(201).json({
      advance: {
        id: advance.id,
        principal: Number(advance.principal_amount),
        outstanding: Number(advance.outstanding_balance),
        fee_rate: Number(advance.fee_rate),
        repayment_rate: Number(advance.repayment_rate),
        term_days: advance.term_days,
        start_date: advance.start_date,
        expected_end_date: advance.expected_end_date,
        status: advance.status,
      },
    })
  } catch (error: any) {
    console.error("Error requesting advance:", error)
    res.status(400).json({ error: error.message })
  }
}
