import { defineConfig, loadEnv } from '@medusajs/framework/utils'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Build Vendor CORS configuration
const getVendorCors = () => {
  const vendorCors = process.env.VENDOR_CORS || ''
  const vendorPanelUrl = process.env.VENDOR_PANEL_URL || ''

  // Combine all origins, removing duplicates
  const origins = new Set<string>()

  vendorCors.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  if (vendorPanelUrl.trim()) origins.add(vendorPanelUrl.trim())

  // Always include production vendor panel
  origins.add('https://vendor.freeblackmarket.com')

  return Array.from(origins).join(',')
}

// Build Store CORS configuration
const getStoreCors = () => {
  const storeCors = process.env.STORE_CORS || ''

  // Combine all origins, removing duplicates
  const origins = new Set<string>()

  storeCors.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))

  // Always include production storefront
  origins.add('https://freeblackmarket.com')

  return Array.from(origins).join(',')
}

// Build Auth CORS to include all frontend origins
const getAuthCors = () => {
  const authCors = process.env.AUTH_CORS || ''
  const vendorPanelUrl = process.env.VENDOR_PANEL_URL || ''
  const vendorCors = process.env.VENDOR_CORS || ''
  const storeCors = process.env.STORE_CORS || ''
  const adminCors = process.env.ADMIN_CORS || ''

  // Combine all origins, removing duplicates
  const origins = new Set<string>()

  authCors.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  vendorCors.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  storeCors.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  adminCors.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  if (vendorPanelUrl.trim()) origins.add(vendorPanelUrl.trim())

  // Always include production origins
  origins.add('https://vendor.freeblackmarket.com')
  origins.add('https://freeblackmarket.com')
  origins.add('https://admin.freeblackmarket.com')

  return Array.from(origins).join(',')
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {}),
    http: {
      storeCors: getStoreCors(),
      adminCors: process.env.ADMIN_CORS || 'https://admin.freeblackmarket.com',
      // vendorCors is used by @mercurjs/b2c-core for /vendor/* routes
      vendorCors: getVendorCors(),
      authCors: getAuthCors(),
      jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET is required in production') })() : 'dev-only-secret-change-in-prod'),
      cookieSecret: process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('COOKIE_SECRET is required in production') })() : 'dev-only-secret-change-in-prod'),
    },
  },
  admin: {
    disable: true,
  },
  plugins: [
    {
      resolve: '@mercurjs/b2c-core',
      options: {},
    },
    { resolve: '@mercurjs/commission', options: {} },
    { resolve: '@mercurjs/reviews', options: {} },
    // @mercurjs/algolia and @mercurjs/requests removed - causing crashes
    // Algolia: Use Postgres filtering (WHERE name ILIKE) instead
    // Requests: Replaced with custom Request module at ./src/modules/request
  ],
  modules: [
    // Phase 1: Domain Architecture Modules
    // Seller Extension module (vendor_type, certifications, etc.)
    {
      resolve: './src/modules/seller-extension',
    },
    // Product Archetype module (behavior-driven product classification)
    {
      resolve: './src/modules/product-archetype',
    },
    
    // Phase 2-4: Barn-to-Door Agricultural Modules
    // Producer module (farm profiles)
    {
      resolve: './src/modules/producer',
    },
    // Agriculture module (harvests, lots, availability windows)
    {
      resolve: './src/modules/agriculture',
    },
    // Cooperative module (food hubs, coops, CSAs)
    {
      resolve: './src/modules/cooperative',
    },
    
    // Ticket Booking module
    {
      resolve: './src/modules/ticket-booking',
    },
    // Restaurant & Delivery modules
    {
      resolve: './src/modules/restaurant',
    },
    {
      resolve: './src/modules/delivery',
    },
    // Digital Product module
    {
      resolve: './src/modules/digital-product',
    },
    // Order Cycle module (OFN-style food commerce)
    {
      resolve: './src/modules/order-cycle',
    },
    // Hawala Ledger module (double-entry bookkeeping, Stellar settlement)
    {
      resolve: './src/modules/hawala-ledger',
    },
    // Subscription module (CSA shares, meal plans, recurring orders)
    {
      resolve: './src/modules/subscription',
    },
    // Wishlist module (customer product wishlists)
    {
      resolve: './src/modules/wishlist',
    },

    // === FreeBlackMarket.com Feature Modules ===
    // Vendor Verification module (trust badges, verification levels)
    {
      resolve: './src/modules/vendor-verification',
    },
    // Impact Metrics module (buyer/producer impact tracking)
    {
      resolve: './src/modules/impact-metrics',
    },
    // Payout Breakdown module (cost transparency)
    {
      resolve: './src/modules/payout-breakdown',
    },
    // Harvest Batches module (scarcity, seasonal availability)
    {
      resolve: './src/modules/harvest-batches',
    },
    // Vendor Rules module (vendor autonomy, fulfillment control)
    {
      resolve: './src/modules/vendor-rules',
    },
    
    // === Community Infrastructure & Solidarity Economy Modules ===
    // Garden module (community gardens, plots, soil zones)
    {
      resolve: './src/modules/garden',
    },
    // Kitchen module (commercial community kitchens, shared-use facilities)
    {
      resolve: './src/modules/kitchen',
    },
    // Governance module (democratic voting, proposals)
    {
      resolve: './src/modules/governance',
    },
    // Harvest module (harvest tracking, allocation pools)
    {
      resolve: './src/modules/harvest',
    },
    // Season module (growing seasons, plantings)
    {
      resolve: './src/modules/season',
    },
    // Volunteer module (time banking, work parties)
    {
      resolve: './src/modules/volunteer',
    },
    // Food Distribution module (solidarity economy transactions)
    {
      resolve: './src/modules/food-distribution',
    },
    // Rental module (product rentals)
    {
      resolve: './src/modules/rental',
    },
    // CMS Blueprint module (types, categories, tags, attributes)
    {
      resolve: './src/modules/cms-blueprint',
    },
    // Request module (RFQs, custom orders - replaces @mercurjs/requests)
    {
      resolve: './src/modules/request',
    },
    // Odoo ERP integration module (optional)
    ...(process.env.ODOO_URL
      ? [
          {
            resolve: './src/modules/odoo',
          },
        ]
      : []),
    
    // Payment providers (Stripe + system default)
    {
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
    },
    // Fulfillment providers (manual + local delivery + shipstation)
    {
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/fulfillment-manual',
            id: 'manual',
          },
          {
            resolve: './src/modules/local-delivery-fulfillment',
            id: 'local-delivery',
          },
          {
            resolve: './src/modules/digital-product-fulfillment',
            id: 'digital',
          },
          // ShipStation fulfillment (optional)
          ...(process.env.SHIPSTATION_API_KEY && process.env.SHIPSTATION_API_SECRET
            ? [
                {
                  resolve: './src/modules/shipstation',
                  id: 'shipstation',
                  options: {
                    apiKey: process.env.SHIPSTATION_API_KEY,
                    apiSecret: process.env.SHIPSTATION_API_SECRET,
                  },
                },
              ]
            : []),
        ],
      },
    },
    // File module
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          ...(process.env.MINIO_ENDPOINT &&
          process.env.MINIO_ACCESS_KEY &&
          process.env.MINIO_SECRET_KEY
            ? [
                {
                  resolve: './src/modules/minio-file',
                  id: 'minio',
                  options: {
                    endPoint: process.env.MINIO_ENDPOINT,
                    accessKey: process.env.MINIO_ACCESS_KEY,
                    secretKey: process.env.MINIO_SECRET_KEY,
                    bucket: process.env.MINIO_BUCKET,
                    publicUrl: process.env.MINIO_PUBLIC_URL, // Optional: custom public URL for file access
                  },
                },
              ]
            : [
                {
                  resolve: '@medusajs/medusa/file-local',
                  id: 'local',
                  options: {
                    upload_dir: 'static',
                    backend_url: `${(process.env.BACKEND_URL || process.env.RAILWAY_STATIC_URL || '').replace(
                      /\/$/,
                      ''
                    )}/static`,
                  },
                },
              ]),
        ],
      },
    },
    // Redis modules
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: '@medusajs/medusa/event-bus-redis',
            options: { 
              redisUrl: process.env.REDIS_URL,
              redisOptions: {
                // Enable TLS for Railway Redis (uses rediss:// protocol)
                ...(process.env.REDIS_URL?.startsWith('rediss://') ? { tls: {} } : {}),
                // BullMQ requires maxRetriesPerRequest to be null
                maxRetriesPerRequest: null,
                enableReadyCheck: true,
                connectTimeout: 10000,
                // Keep connection alive
                keepAlive: 30000,
              },
            },
          },
          {
            resolve: '@medusajs/medusa/workflow-engine-redis',
            options: {
              redis: {
                redisUrl: process.env.REDIS_URL,
                // Enable TLS for Railway Redis (uses rediss:// protocol)
                ...(process.env.REDIS_URL?.startsWith('rediss://') ? { tls: {} } : {}),
                // BullMQ requires maxRetriesPerRequest to be null
                maxRetriesPerRequest: null,
                enableReadyCheck: true,
                connectTimeout: 10000,
                // Keep connection alive
                keepAlive: 30000,
              },
            },
          },
        ]
      : []),
    // Notification module (Email provider - SMTP or Resend)
    // SMTP takes priority if configured, otherwise falls back to Resend
    ...(process.env.SMTP_HOST
      ? [
          {
            resolve: '@medusajs/medusa/notification',
            options: {
              providers: [
                {
                  resolve: './src/modules/smtp',
                  id: 'smtp',
                  options: {
                    channels: ['email'],
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                      user: process.env.SMTP_USER,
                      pass: process.env.SMTP_PASS,
                    },
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                  },
                },
              ],
            },
          },
        ]
      : process.env.RESEND_API_KEY
      ? [
          {
            resolve: '@medusajs/medusa/notification',
            options: {
              providers: [
                {
                  resolve: './src/modules/resend',
                  id: 'resend',
                  options: {
                    channels: ['email'],
                    api_key: process.env.RESEND_API_KEY,
                    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
  // Note: Links are auto-discovered from src/links directory in MedusaJS v2
  // No explicit registration needed here
})
