import { defineConfig, loadEnv } from '@medusajs/framework/utils'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Build CORS configuration dynamically
const getStoreCors = () => {
  const baseCors = process.env.STORE_CORS || 'http://localhost:8000,https://docs.medusajs.com'
  const vendorPanelUrl = process.env.VENDOR_PANEL_URL
  const vendorCors = process.env.VENDOR_CORS
  
  let cors = baseCors
  
  // Add VENDOR_PANEL_URL if explicitly set
  if (vendorPanelUrl && !baseCors.includes(vendorPanelUrl)) {
    cors = `${cors},${vendorPanelUrl}`
  }
  
  // Also add VENDOR_CORS if it's different from baseCors (for vendor panel access to store endpoints)
  if (vendorCors && !cors.includes(vendorCors)) {
    cors = `${cors},${vendorCors}`
  }
  
  return cors
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {}),
    http: {
      storeCors: getStoreCors(),
      adminCors: process.env.ADMIN_CORS!,
      // @ts-expect-error: vendorCors is not a valid config
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET is required in production') })() : 'dev-only-secret-change-in-prod'),
      cookieSecret: process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('COOKIE_SECRET is required in production') })() : 'dev-only-secret-change-in-prod'),
    },
  },
  admin: {
    disable: true,
  },
  plugins: [
    { resolve: '@mercurjs/b2c-core', options: {} },
    { resolve: '@mercurjs/commission', options: {} },
    ...(process.env.ALGOLIA_API_KEY && process.env.ALGOLIA_APP_ID
      ? [
          {
            resolve: '@mercurjs/algolia',
            options: {
              apiKey: process.env.ALGOLIA_API_KEY,
              appId: process.env.ALGOLIA_APP_ID,
            },
          },
        ]
      : []),
    { resolve: '@mercurjs/reviews', options: {} },
    { resolve: '@mercurjs/requests', options: {} },
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
                url: process.env.REDIS_URL,
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
    // Notification module (Resend email provider)
    ...(process.env.RESEND_API_KEY
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
  links: [
    // Link seller to seller metadata for vendor_type and extended fields
    {
      resolve: './src/links/seller-metadata',
    },
    // Note: Wishlist model renamed from customer_wishlist to shopper_wishlist
    // to avoid alias collision with the Customer module

    // Rental module links
    {
      resolve: './src/links/product-rental-config',
    },
    {
      resolve: './src/links/rental-variant',
    },
    {
      resolve: './src/links/rental-order',
    },
    {
      resolve: './src/links/rental-line-item',
    },
    {
      resolve: './src/links/customer-rental',
    },
  ],
})
