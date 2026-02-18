import Medusa from "@medusajs/js-sdk"

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_MEDUSA_BACKEND_URL ||
  (typeof __BACKEND_URL__ !== "undefined" ? __BACKEND_URL__ : undefined) ||
  "/"

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})
