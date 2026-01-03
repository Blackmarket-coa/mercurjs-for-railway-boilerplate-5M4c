/**
 * Readiness Check Endpoint
 * 
 * Used by Railway, Kubernetes, and load balancers to check if the service
 * is ready to accept traffic. Checks database connectivity and optional Redis.
 * 
 * Returns 200 if all critical services are available, 503 if degraded.
 * 
 * Usage:
 * - Kubernetes: Use for readinessProbe
 * - Load balancers: Use to determine if instance can receive traffic
 */
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createClient, RedisClientType } from "redis"

interface HealthChecks {
  database: boolean
  redis: boolean | "not_configured"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const checks: HealthChecks = {
    database: false,
    redis: "not_configured",
  }

  const startTime = Date.now()

  try {
    // Check database connectivity
    const query = req.scope.resolve("remoteQuery")
    // Simple query to verify database is reachable
    await query({
      entryPoint: "region",
      fields: ["id"],
      variables: { take: 1 },
    })
    checks.database = true
  } catch (error) {
    console.error("[Health] Database check failed:", error)
    checks.database = false
  }

  // Check Redis if configured
  if (process.env.REDIS_URL) {
    let redisClient: RedisClientType | null = null
    try {
      redisClient = createClient({ 
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 3000, // 3 second timeout
        }
      })
      await redisClient.connect()
      await redisClient.ping()
      checks.redis = true
      await redisClient.quit()
    } catch (error) {
      console.error("[Health] Redis check failed:", error)
      checks.redis = false
      if (redisClient) {
        try {
          await redisClient.quit()
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  const responseTime = Date.now() - startTime

  // Determine overall health status
  const criticalChecks = [checks.database]
  // Redis is optional, only fail if configured but unavailable
  if (checks.redis !== "not_configured") {
    criticalChecks.push(checks.redis as boolean)
  }

  const allHealthy = criticalChecks.every(Boolean)
  const status = allHealthy ? "ready" : "unhealthy"

  res.status(allHealthy ? 200 : 503).json({
    status,
    service: "freeblackmarket-backend",
    checks,
    responseTimeMs: responseTime,
    timestamp: new Date().toISOString(),
  })
}
