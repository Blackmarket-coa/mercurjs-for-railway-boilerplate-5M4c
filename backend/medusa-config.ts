import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Build Redis modules array conditionally
const redisModules = process.env.REDIS_URL
  ? [
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: { redisUrl: process.env.REDIS_URL },
      },
      {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: { redis: { url: process.env.REDIS_URL } },
      },
    ]
  : []

// Build file storage module conditionally
const fileModule = process.env.S3_FILE_URL
  ? [
      {
        resolve: "@medusajs/medusa/file",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/file-s3",
              id: "s3",
              options: {
                file_url: process.env.S3_FILE_URL,
                access_key_id: process.env.S3_ACCESS_KEY_ID,
                secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                region: process.env.S3_REGION,
                bucket: process.env.S3_BUCKET,
                endpoint: process.env.S3_ENDPOINT,
                additional_client_config: {
                  forcePathStyle: true,
                },
              },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      // @ts-expect-error: vendorCors is not a valid config
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    redisUrl: process.env.REDIS_URL,
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  // MercurJS packages go in plugins, not modules!
  plugins: [
    {
      resolve: "@mercurjs/b2c-core",
      options: {},
    },
    {
      resolve: "@mercurjs/commission",
      options: {},
    },
    {
      resolve: "@mercurjs/requests",
      options: {},
    },
    {
      resolve: "@mercurjs/reviews",
      options: {},
    },
    {
      resolve: "@mercurjs/framework",
      options: {},
    },
    // Algolia search (if configured)
    ...(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY
      ? [
          {
            resolve: "@mercurjs/algolia",
            options: {
              appId: process.env.ALGOLIA_APP_ID,
              apiKey: process.env.ALGOLIA_API_KEY,
            },
          },
        ]
      : []),
    // Stripe Connect payments (if configured)
    ...(process.env.STRIPE_API_KEY
      ? [
          {
            resolve: "@mercurjs/payment-stripe-connect",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ]
      : []),
    // Resend emails (if configured)
    ...(process.env.RESEND_API_KEY
      ? [
          {
            resolve: "@mercurjs/resend",
            options: {
              apiKey: process.env.RESEND_API_KEY,
              fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
            },
          },
        ]
      : []),
  ],
  // Standard Medusa modules
  modules: [
    // Redis modules (if REDIS_URL is set)
    ...redisModules,
    // File storage module (if S3 is configured)
    ...fileModule,
  ],
})
