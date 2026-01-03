/**
 * Health Check Endpoint - Liveness Probe
 * 
 * Used by Railway, Kubernetes, and load balancers to check if the service is alive.
 * This endpoint should return 200 if the process is running.
 * 
 * Usage:
 * - Railway: Set healthcheckPath to "/health"
 * - Kubernetes: Use for livenessProbe
 */
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.status(200).json({
    status: "ok",
    service: "freeblackmarket-backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
