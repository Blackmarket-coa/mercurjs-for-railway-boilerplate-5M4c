import Medusa from "@medusajs/js-sdk"

// Backend URL - use env var or fallback to Railway production URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_MEDUSA_BACKEND_URL ||
  "https://mercurjs-for-railway-boilerplate-5m4c-production.up.railway.app"

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})
