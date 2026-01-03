/**
 * Centralized Configuration Validator
 * 
 * Validates environment variables at startup with clear error messages.
 * Provides type-safe access to configuration throughout the application.
 * 
 * Usage:
 * ```typescript
 * import { config } from "../shared/config"
 * 
 * // Access validated config
 * const dbUrl = config.DATABASE_URL
 * const stellarKey = config.STELLAR_SECRET_KEY // undefined if not set
 * ```
 */
import { z } from "zod"
import { createLogger } from "./logger"

const logger = createLogger("Config")

/**
 * Environment variable schema with validation rules
 */
const envSchema = z.object({
  // Required
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Database (required)
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  
  // Redis (optional but recommended for production)
  REDIS_URL: z.string().url().optional(),
  
  // Server configuration
  PORT: z.string().transform(Number).default("9000"),
  BACKEND_URL: z.string().url().optional(),
  STOREFRONT_URL: z.string().url().optional(),
  ADMIN_URL: z.string().url().optional(),
  VENDOR_URL: z.string().url().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters").optional(),
  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET must be at least 32 characters").optional(),
  
  // Stellar blockchain (optional)
  STELLAR_SECRET_KEY: z.string().length(56, "STELLAR_SECRET_KEY must be 56 characters").optional(),
  STELLAR_NETWORK: z.enum(["testnet", "public"]).default("testnet"),
  
  // Stripe (optional)
  STRIPE_API_KEY: z.string().startsWith("sk_", "STRIPE_API_KEY must start with 'sk_'").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  
  // External services (empty strings treated as undefined)
  ROCKETCHAT_URL: z.string().transform(v => v || undefined).pipe(z.string().url().optional()),
  APPRISE_API_URL: z.string().transform(v => v || undefined).pipe(z.string().url().optional()),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().transform(v => v || undefined).pipe(z.string().email().optional()),
  
  // Algolia search
  ALGOLIA_APP_ID: z.string().optional(),
  ALGOLIA_ADMIN_KEY: z.string().optional(),
  
  // OpenTelemetry
  OTEL_ENABLED: z.string().transform(v => v === "true").default("false"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().transform(v => v || undefined).pipe(z.string().url().optional()),
  OTEL_SERVICE_NAME: z.string().default("freeblackmarket-backend"),
  
  // Feature flags
  ENABLE_STELLAR_SETTLEMENT: z.string().transform(v => v === "true").default("false"),
  ENABLE_STRIPE_ACH: z.string().transform(v => v === "true").default("false"),
})

export type Config = z.infer<typeof envSchema>

/**
 * Validate and load configuration from environment variables
 */
function loadConfig(): Config {
  const result = envSchema.safeParse(process.env)
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `  - ${e.path.join(".")}: ${e.message}`)
    logger.error("Configuration validation failed:\n" + errors.join("\n"))
    
    // In development, log helpful hints
    if (process.env.NODE_ENV !== "production") {
      console.error("\n❌ Environment configuration errors found:")
      errors.forEach(e => console.error(e))
      console.error("\nCheck your .env file and ensure all required variables are set.\n")
    }
    
    // Don't throw in development to allow partial startup
    if (process.env.NODE_ENV === "production") {
      throw new Error("Configuration validation failed. Check logs for details.")
    }
    
    // Return partial config for development
    return result.data as unknown as Config
  }
  
  // Production warnings
  if (result.data.NODE_ENV === "production") {
    const warnings: string[] = []
    
    if (!result.data.REDIS_URL) {
      warnings.push("REDIS_URL not set - rate limiting and caching will use in-memory storage")
    }
    if (!result.data.JWT_SECRET) {
      warnings.push("JWT_SECRET not set - using default (INSECURE)")
    }
    if (!result.data.COOKIE_SECRET) {
      warnings.push("COOKIE_SECRET not set - using default (INSECURE)")
    }
    if (!result.data.OTEL_ENABLED) {
      warnings.push("OTEL_ENABLED=false - OpenTelemetry observability disabled")
    }
    
    warnings.forEach(w => logger.warn(w))
  }
  
  logger.info("Configuration loaded successfully", {
    environment: result.data.NODE_ENV,
    redisConfigured: !!result.data.REDIS_URL,
    stellarConfigured: !!result.data.STELLAR_SECRET_KEY,
    stripeConfigured: !!result.data.STRIPE_API_KEY,
    otelEnabled: result.data.OTEL_ENABLED,
  })
  
  return result.data
}

// Export validated configuration singleton
export const config = loadConfig()

// Helper functions for common config checks
export const isProduction = () => config.NODE_ENV === "production"
export const isDevelopment = () => config.NODE_ENV === "development"
export const isTest = () => config.NODE_ENV === "test"

// Feature flag helpers
export const features = {
  stellarSettlement: () => config.ENABLE_STELLAR_SETTLEMENT && !!config.STELLAR_SECRET_KEY,
  stripeACH: () => config.ENABLE_STRIPE_ACH && !!config.STRIPE_API_KEY,
  redis: () => !!config.REDIS_URL,
  openTelemetry: () => config.OTEL_ENABLED,
}

// Export schema for testing
export { envSchema }
