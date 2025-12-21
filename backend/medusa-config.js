modules: [
  {
    resolve: '@medusajs/medusa/file',
    options: {
      providers: [
        ...(process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY
          ? [{
              resolve: './modules/minio-file',
              id: 'minio',
              options: {
                endPoint: process.env.MINIO_ENDPOINT,
                accessKey: process.env.MINIO_ACCESS_KEY,
                secretKey: process.env.MINIO_SECRET_KEY,
                bucket: process.env.MINIO_BUCKET
              }
            }]
          : [{
              resolve: '@medusajs/medusa/file-local',
              id: 'local',
              options: {
                upload_dir: 'static',
                backend_url: `${process.env.BACKEND_URL || ''}/static`
              }
            }])
      ]
    }
  },
  ...(process.env.REDIS_URL
    ? [
        { resolve: '@medusajs/medusa/event-bus-redis', options: { redisUrl: process.env.REDIS_URL } },
        { resolve: '@medusajs/medusa/workflow-engine-redis', options: { redis: { url: process.env.REDIS_URL } } }
      ]
    : []),
  ...(process.env.STRIPE_SECRET_API_KEY && process.env.STRIPE_WEBHOOK_SECRET
    ? [{
        resolve: '@medusajs/medusa/payment',
        options: {
          providers: [
            {
              resolve: '@mercurjs/payment-stripe-connect/providers/stripe-connect',
              id: 'stripe-connect',
              options: {
                apiKey: process.env.STRIPE_SECRET_API_KEY,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
              }
            }
          ]
        }
      }]
    : []),
  {
    resolve: '@medusajs/medusa/notification',
    options: {
      providers: [
        ...(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL
          ? [{
              resolve: '@mercurjs/resend/providers/resend',
              id: 'resend',
              options: {
                channels: ['email'],
                api_key: process.env.RESEND_API_KEY,
                from: process.env.RESEND_FROM_EMAIL
              }
            }]
          : []),
        { resolve: '@medusajs/medusa/notification-local', id: 'local', options: { channels: ['feed', 'seller_feed'] } }
      ]
    }
  },
  {
    resolve: "@medusajs/medusa/fulfillment",
    options: {
      providers: [
        { resolve: "@medusajs/medusa/fulfillment-manual", id: "manual" },
        ...(process.env.SHIPSTATION_API_KEY
          ? [{
              resolve: "./modules/shipstation",
              id: "shipstation",
              options: { api_key: process.env.SHIPSTATION_API_KEY },
            }]
          : [])
      ],
    }
  },
  { resolve: "./modules/digital-product" }
]
