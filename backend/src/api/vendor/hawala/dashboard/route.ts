import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HAWALA_LEDGER_MODULE } from "../../../../modules/hawala-ledger"
import HawalaLedgerModuleService from "../../../../modules/hawala-ledger/service"

/**
 * GET /vendor/hawala/dashboard
 * Get comprehensive financial dashboard for the authenticated vendor
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const hawalaService = req.scope.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)
    
    // Get vendor ID from auth context
    const vendorId = (req as any).auth_context?.actor_id
    if (!vendorId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const dashboard = await hawalaService.getVendorDashboard(vendorId)
    
    res.json({ dashboard })
  } catch (error: any) {
    console.error("Error getting vendor dashboard:", error)
    res.status(400).json({ error: error.message })
  }
}
