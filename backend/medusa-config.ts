import { defineConfig, loadEnv } from '@medusajs/framework/utils'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// ============================================================================
// CORS Configuration Utilities
// ============================================================================

/**
 * Parse CORS string into a Set of origins
 */
const parseCorsOrigins = (corsString: string): Set<string> => {
  const origins = new Set<string>()
  corsString.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  return origins
}

/**
 * Build CORS configuration from environment variables and defaults
 */
const buildCors = (envVars: string[], defaultOrigins: string[]): string => {
  const origins = new Set<string>()

  // Add environment variable origins
  envVars.forEach(envVar => {
    const value = process.env[envVar] || ''
    parseCorsOrigins(value).forEach(o => origins.add(o))
  })

  // Add default origins
  defaultOrigins.forEach(o => origins.add(o))

  return Array.from(origins).join(',')
}

// CORS configurations
const vendorCors = buildCors(
  ['VENDOR_CORS', 'VENDOR_PANEL_URL'],
  ['https://vendor.freeblackmarket.com']
)

const storeCors = buildCors(
  ['STORE_CORS'],
  ['https://freeblackmarket.com']
)

const authCors = buildCors(
  ['AUTH_CORS', 'VENDOR_CORS', 'STORE_CORS', 'ADMIN_CORS', 'VENDOR_PANEL_URL'],
  ['https://vendor.freeblackmarket.com', 'https://freeblackmarket.com', 'https://admin.freeblackmarket.com']
)

const adminCors = buildCors(
  ['ADMIN_CORS'],
  ['https://admin.freeblackmarket.com', 'https://admin-dashboard-production-cc8f.up.railway.app']
)

// ============================================================================
// Redis Configuration Utility
// ============================================================================

/**
 * Build Redis connection options with TLS support for Railway
 */
const getRedisOptions = () => {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) return null

  return {
    redisUrl,
    // Enable TLS for Railway Redis (uses rediss:// protocol)
    ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
    // BullMQ requires maxRetriesPerRequest to be null
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: 10000,
    keepAlive: 30000,
  }
}

// ============================================================================
// Module Definitions - Organized by Domain
// ============================================================================

// Core platform modules (always loaded)
const coreModules = [
  { resolve: './src/modules/seller-extension' },
  { resolve: './src/modules/product-archetype' },
]

// Agricultural/barn-to-door modules
const agricultureModules = [
  { resolve: './src/modules/producer' },
  { resolve: './src/modules/agriculture' },
  { resolve: './src/modules/cooperative' },
]

// Commerce feature modules
const commerceModules = [
  { resolve: './src/modules/ticket-booking' },
  { resolve: './src/modules/restaurant' },
  { resolve: './src/modules/delivery' },
  { resolve: './src/modules/digital-product' },
  { resolve: './src/modules/order-cycle' },
  { resolve: './src/modules/subscription' },
  { resolve: './src/modules/rental' },
  { resolve: './src/modules/wishlist' },
]

// Financial/ledger modules
const financialModules = [
  { resolve: './src/modules/hawala-ledger' },
]

// FreeBlackMarket.com feature modules
const marketplaceModules = [
  { resolve: './src/modules/vendor-verification' },
  { resolve: './src/modules/impact-metrics' },
  { resolve: './src/modules/payout-breakdown' },
  { resolve: './src/modules/harvest-batches' },
  { resolve: './src/modules/vendor-rules' },
]

// Community infrastructure modules
const communityModules = [
  { resolve: './src/modules/garden' },
  { resolve: './src/modules/kitchen' },
  { resolve: './src/modules/governance' },
  { resolve: './src/modules/harvest' },
  { resolve: './src/modules/season' },
  { resolve: './src/modules/volunteer' },
  { resolve: './src/modules/food-distribution' },
]

// Content/utility modules
const utilityModules = [
  { resolve: './src/modules/cms-blueprint' },
  { resolve: './src/modules/request' },
]

// Optional modules (conditionally loaded based on environment)
const optionalModules = [
  // Odoo ERP integration
  ...(process.env.ODOO_URL ? [{ resolve: './src/modules/odoo' }] : []),
]

// ============================================================================
// Provider Configurations
// ============================================================================

// Payment providers
const paymentModule = {
  resolve: '@medusajs/medusa/payment',
  options: {
    providers: [
      {
        resolve: '@medusajs/medusa/payment-stripe',
        id: 'stripe',
        options: {
          apiKey: process.env.STRIPE_API_KEY || '',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        },
      },
    ],
  },
}

// Fulfillment providers
const fulfillmentModule = {
  resolve: '@medusajs/medusa/fulfillment',
  options: {
    providers: [
      { resolve: '@medusajs/medusa/fulfillment-manual', id: 'manual' },
      { resolve: './src/modules/local-delivery-fulfillment', id: 'local-delivery' },
      { resolve: './src/modules/digital-product-fulfillment', id: 'digital' },
      // ShipStation fulfillment (optional)
      ...(process.env.SHIPSTATION_API_KEY && process.env.SHIPSTATION_API_SECRET
        ? [{
            resolve: './src/modules/shipstation',
            id: 'shipstation',
            options: {
              apiKey: process.env.SHIPSTATION_API_KEY,
              apiSecret: process.env.SHIPSTATION_API_SECRET,
            },
          }]
        : []),
    ],
  },
}

// File storage module
const fileModule = {
  resolve: '@medusajs/medusa/file',
  options: {
    providers: [
      ...(process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY
        ? [{
            resolve: './src/modules/minio-file',
            id: 'minio',
            options: {
              endPoint: process.env.MINIO_ENDPOINT,
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY,
              bucket: process.env.MINIO_BUCKET,
              publicUrl: process.env.MINIO_PUBLIC_URL,
            },
          }]
        : [{
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${(process.env.BACKEND_URL || process.env.RAILWAY_STATIC_URL || '').replace(/\/$/, '')}/static`,
            },
          }]),
    ],
  },
}

// Redis-based modules (event bus + workflow engine)
const redisModules = (() => {
  const redisOptions = getRedisOptions()
  if (!redisOptions) return []

  return [
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: { redisUrl: redisOptions.redisUrl, redisOptions },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: { redis: redisOptions },
    },
  ]
})()

// Notification module (Email provider - SMTP or Resend)
const notificationModules = (() => {
  if (process.env.SMTP_HOST) {
    return [{
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [{
          resolve: './src/modules/smtp',
          id: 'smtp',
          options: {
            channels: ['email'],
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
          },
        }],
      },
    }]
  }

  if (process.env.RESEND_API_KEY) {
    return [{
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [{
          resolve: './src/modules/resend',
          id: 'resend',
          options: {
            channels: ['email'],
            api_key: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          },
        }],
      },
    }]
  }

  return []
})()

// ============================================================================
// Export Configuration
// ============================================================================

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {}),
    http: {
      storeCors,
      adminCors,
      vendorCors,
      authCors,
      jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
        ? (() => { throw new Error('JWT_SECRET is required in production') })()
        : 'dev-only-secret-change-in-prod'),
      cookieSecret: process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'production'
        ? (() => { throw new Error('COOKIE_SECRET is required in production') })()
        : 'dev-only-secret-change-in-prod'),
    } as any,
  },
  admin: {
    disable: true,
  },
  plugins: [
    { resolve: '@mercurjs/b2c-core', options: {} },
    { resolve: '@mercurjs/commission', options: {} },
    { resolve: '@mercurjs/reviews', options: {} },
    // @mercurjs/algolia and @mercurjs/requests removed - causing crashes
    // Algolia: Use Postgres filtering (WHERE name ILIKE) instead
    // Requests: Replaced with custom Request module at ./src/modules/request
  ],
  modules: [
    // Domain modules (organized by category)
    ...coreModules,
    ...agricultureModules,
    ...commerceModules,
    ...financialModules,
    ...marketplaceModules,
    ...communityModules,
    ...utilityModules,
    ...optionalModules,

    // Provider modules
    paymentModule,
    fulfillmentModule,
    fileModule,
    ...redisModules,
    ...notificationModules,
  ],
  // Note: Links are auto-discovered from src/links directory in MedusaJS v2
})
