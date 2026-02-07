import Medusa from "@medusajs/js-sdk"

type ViteEnv = {
  VITE_BACKEND_URL?: string
  DEV?: boolean
}

const readViteEnv = (): ViteEnv | undefined => {
  try {
    return Function("return import.meta.env")() as ViteEnv
  } catch {
    return undefined
  }
}

const viteEnv = readViteEnv()

export const sdk = new Medusa({
  baseUrl: viteEnv?.VITE_BACKEND_URL || "/",
  debug: viteEnv?.DEV ?? process.env.NODE_ENV !== "production",
  auth: {
    type: "session",
  },
})
