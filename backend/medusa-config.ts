import { defineConfig, loadEnv } from '@medusajs/framework/utils'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {}),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      // @ts-expect-error: vendorCors is not a valid config
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
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
    { resolve: '@mercurjs/resend', options: {} },
    { resolve: 'my-plugin', options: {} },
  ],
  modules: [
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
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            resolve: '@medusajs/medusa/workflow-engine-redis',
            options: { redis: { url: process.env.REDIS_URL } },
          },
        ]
      : []),
    // Digital Product module
    {
      resolve: './src/modules/digital-product',
      options: {},
      definition: {
        isQueryable: true,
      },
    },
    // Ticket Booking module
    {
      resolve: './src/modules/ticket-booking',
      options: {},
      definition: {
        isQueryable: true,
      },
    },
    // Restaurant module
    {
      resolve: "./modules/restaurant",
    },
    // Delivery module
    {
      resolve: "./modules/delivery",
    },
  ],
})
