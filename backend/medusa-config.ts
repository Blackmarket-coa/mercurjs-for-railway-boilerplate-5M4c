import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // ... rest of projectConfig
  },
  admin: {
    disable: true,
  },
  plugins: [
    // ... your plugins
  ],
  modules: [
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
    // Digital Product module - ADD THIS HERE
    {
      resolve: './src/modules/digital-product',
    },
    // File module
    {
      resolve: '@medusajs/medusa/file',
      options: {
        // ... your file options
      },
    },
    // Redis modules
    // ... rest of modules
  ],
})
// REMOVE THE DUPLICATE module.exports below!
