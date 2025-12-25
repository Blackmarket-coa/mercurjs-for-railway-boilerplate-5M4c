import { loadEnv, defineConfig } from "@medusajs/framework/utils"

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
  modules: [
    // MercurJS modules
    {
      resolve: "@mercurjs/mercur-vendor",
    },
    {
      resolve: "@mercurjs/mercur-fulfillment",
    },
    {
      resolve: "@mercurjs/mercur-payment-stripe",
      options: {
        apiKey: process.env.STRIPE_API_KEY,
      },
    },
    // Restaurant/Producer Module (for local food delivery)
    {
      resolve: "./src/modules/restaurant",
    },
    // Delivery Module (drivers and delivery tracking)
    {
      resolve: "./src/modules/delivery",
    },
    // Odoo ERP integration
    {
      resolve: "./src/modules/odoo",
    },
    // Redis modules (if REDIS_URL is set)
    ...redisModules,
    // File storage module (if S3 is configured)
    ...fileModule,
  ],
})
